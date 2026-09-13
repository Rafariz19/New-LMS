import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import TeacherApprovalPage from '../pages/admin/TeacherApprovalPage';
import AdminClassesPage from '../pages/admin/AdminClassesPage';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import ClassesPage from '../pages/teacher/ClassesPage';
import ClassDetailPage from '../pages/teacher/ClassDetailPage';
import SubmissionsGradingPage from '../pages/teacher/SubmissionsGradingPage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import ExploreClassesPage from '../pages/student/ExploreClassesPage';
import MyClassesPage from '../pages/student/MyClassesPage';
import StudentClassDetailPage from '../pages/student/StudentClassDetailPage';
import GradesHistoryPage from '../pages/student/GradesHistoryPage';

// 404
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  const getHomeRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'teacher') return <Navigate to="/teacher" replace />;
    if (role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Root Route: Redirect to role-based dashboard */}
      <Route path="/" element={getHomeRedirect()} />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? getHomeRedirect() : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? getHomeRedirect() : <RegisterPage />
        }
      />

      {/* Admin Module */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="teachers" element={<TeacherApprovalPage />} />
        <Route path="classes" element={<AdminClassesPage />} />
      </Route>

      {/* Teacher Module */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="classes/:id" element={<ClassDetailPage />} />
        <Route path="grading" element={<SubmissionsGradingPage />} />
      </Route>

      {/* Student Module */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="explore" element={<ExploreClassesPage />} />
        <Route path="my-classes" element={<MyClassesPage />} />
        <Route path="class/:id" element={<StudentClassDetailPage />} />
        <Route path="grades" element={<GradesHistoryPage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
