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

import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AppShell from './AppShell';
import StudentJoin from './pages/StudentJoin';
import TeacherOnboarding from './pages/TeacherOnboarding';
import TeacherDashboard from './pages/TeacherDashboard';
import ClassDetail from './pages/ClassDetail';

export default function AppRouter() {
  return (
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
  );
}
