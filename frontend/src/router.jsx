// EduBridge top-level router
// Public:
//   /                      → LandingPage (marketing)
//   /app                   → App (gamified tutor experience)
//   /join                  → StudentJoin (enter class code)
// Teacher:
//   /teacher               → TeacherDashboard (self-redirects to onboarding if no profile)
//   /teacher/onboarding    → TeacherOnboarding (3-step setup wizard)
//   /teacher/dashboard     → TeacherDashboard (classes overview)
//   /teacher/class/:classId → ClassDetail (student roster + progress)

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AppShell from './AppShell';

// Teacher pages and student-join are only used by a subset of users.
// Lazy-load them so the initial bundle for children on slow connections is smaller.
const StudentJoin = lazy(() => import('./pages/StudentJoin'));
const TeacherOnboarding = lazy(() => import('./pages/TeacherOnboarding'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const ClassDetail = lazy(() => import('./pages/ClassDetail'));

const PageLoader = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--color-muted)', fontSize: 14 }}>
    Loading…
  </div>
);

export default function AppRouter() {
  return (
    <Suspense fallback={PageLoader}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppShell />} />
        <Route path="/join" element={<StudentJoin />} />

        {/* Teacher flow */}
        <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="/teacher/onboarding" element={<TeacherOnboarding />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/class/:classId" element={<ClassDetail />} />

        {/* Catch-all: redirect unknown routes to landing */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Suspense>
  );
}
