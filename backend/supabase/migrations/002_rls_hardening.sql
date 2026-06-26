-- EduBridge — RLS Hardening Migration 002
-- Fixes five security issues found in the 001 migration:
--
-- 1. class_members INSERT: "student joins class" had no WITH CHECK, allowing
--    any authenticated user to insert rows with any student_id (impersonation).
-- 2. classes SELECT: "anyone can read active classes" exposed ALL teacher
--    classes to ALL authenticated users — leaked teacher info to any student.
-- 3. classes SELECT: "members can read class" had a self-reference bug
--    (class_members.class_id = class_members.id instead of classes.id),
--    so the policy was effectively always false.
-- 4. user_progress SELECT/UPDATE: no policy for teachers to read their
--    students' progress rows (teachers saw nothing in their dashboards).
-- 5. teacher_profiles SELECT: students had no way to look up their teacher's
--    display name (needed when showing class info in the student UI).

-- ── Fix 1: Restrict class_members INSERT to own student_id ──────────────────
DROP POLICY IF EXISTS "student joins class" ON public.class_members;
CREATE POLICY "student joins class"
  ON public.class_members
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- ── Fix 2: Drop the overly broad classes SELECT policy ──────────────────────
DROP POLICY IF EXISTS "anyone can read active classes" ON public.classes;

-- ── Fix 3: Replace broken members-can-read-class policy ─────────────────────
--    Old qual used class_members.class_id = class_members.id (self-reference).
--    Correct qual must compare against classes.id (the current row's PK).
DROP POLICY IF EXISTS "members can read class" ON public.classes;
CREATE POLICY "members can read class"
  ON public.classes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_members cm
      WHERE cm.class_id = id
        AND cm.student_id = auth.uid()
    )
  );

-- ── Fix 4: Add teacher read access to their students' progress ───────────────
--    Teachers need to read user_progress rows for students in their classes.
CREATE POLICY "teacher reads class progress"
  ON public.user_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.class_members cm
      JOIN public.classes c ON c.id = cm.class_id
      WHERE cm.student_id = user_progress.user_id
        AND c.teacher_id = auth.uid()
    )
  );

-- ── Fix 5: Allow students to read their teacher's display name ───────────────
--    Narrow read: only the name field would be ideal, but Postgres RLS is
--    row-level not column-level. We allow SELECT on teacher_profiles where
--    the requesting user is a student in one of that teacher's classes.
--    Teachers' grades/subjects/school are already public on the class row,
--    so this does not meaningfully expand the information surface.
CREATE POLICY "student reads class teacher"
  ON public.teacher_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.classes c
      JOIN public.class_members cm ON cm.class_id = c.id
      WHERE c.teacher_id = teacher_profiles.user_id
        AND cm.student_id = auth.uid()
    )
  );
