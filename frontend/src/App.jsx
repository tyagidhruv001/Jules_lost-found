import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const FacultyDashboard = lazy(() => import('./pages/faculty/Dashboard'));
const ItemSearch = lazy(() => import('./pages/shared/ItemSearch'));
const ItemDetails = lazy(() => import('./pages/shared/ItemDetails'));
const ReportWizard = lazy(() => import('./pages/student/ReportWizard'));
const MyActivity = lazy(() => import('./pages/student/MyActivity'));
const VerifyQueue = lazy(() => import('./pages/faculty/VerifyQueue'));
const ItemsQueue = lazy(() => import('./pages/faculty/ItemsQueue'));
const UserProfile = lazy(() => import('./pages/shared/UserProfile'));
const NotFound = lazy(() => import('./pages/shared/NotFound'));

function App() {
    const { isAuthenticated, user } = useAuth();

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="spinner"></div></div>}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />}
                />
                <Route path="/register" element={<Register />} />

                {/* Student Routes */}
                <Route path="/student/*" element={
                    <ProtectedRoute role="student">
                        <Routes>
                            <Route path="dashboard" element={<StudentDashboard />} />
                            <Route path="search" element={<ItemSearch />} />
                            <Route path="items/:id" element={<ItemDetails />} />
                            <Route path="report" element={<ReportWizard />} />
                            <Route path="activity" element={<MyActivity />} />
                            <Route path="profile" element={<UserProfile />} />
                            <Route path="*" element={<Navigate to="dashboard" replace />} />
                        </Routes>
                    </ProtectedRoute>
                } />

                {/* Faculty Routes */}
                <Route path="/faculty/*" element={
                    <ProtectedRoute role="faculty">
                        <Routes>
                            <Route path="dashboard" element={<FacultyDashboard />} />
                            <Route path="verify" element={<VerifyQueue />} />
                            <Route path="items-queue" element={<ItemsQueue />} />
                            <Route path="search" element={<ItemSearch />} />
                            <Route path="items/:id" element={<ItemDetails />} />
                            <Route path="profile" element={<UserProfile />} />
                            <Route path="*" element={<Navigate to="dashboard" replace />} />
                        </Routes>
                    </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}

export default App;
