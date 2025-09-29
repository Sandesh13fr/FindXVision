import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import MissingPersonForm from './components/MissingPerson/MissingPersonForm';
import MissingPersonsList from './components/MissingPerson/MissingPersonsList';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import TailwindTestPage from './pages/Auth/TailwindTestPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import MissingPersonsAdmin from './pages/Admin/MissingPersonsAdmin';
import ProfilePage from './pages/Profile/ProfilePage';
import { useDispatch } from 'react-redux';
import { checkAuthStatus } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch]);
  return (
     <BrowserRouter>
      <Navbar />
      <Routes>
  <Route path="/" element={<LandingPage />} />
        <Route
          path="/report"
          element={(
            <ProtectedRoute>
              <MissingPersonForm />
            </ProtectedRoute>
          )}
        />
        <Route path="/missing-persons" element={<MissingPersonsList />} />
        <Route
          path="/profile"
          element={(
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          )}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth-test" element={<TailwindTestPage />} />
        <Route
          path="/admin/missing-persons"
          element={(
            <ProtectedRoute requiredRole="ADMIN">
              <MissingPersonsAdmin />
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;