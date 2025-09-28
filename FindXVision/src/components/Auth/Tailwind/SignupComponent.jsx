import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerThunk, clearError } from '../../../store/slices/authSlice';
import TailwindPrimaryButton from '../../Common/TailwindPrimaryButton';

const SignupComponent = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      // Handle password mismatch error
      return;
    }
    
    try {
      await dispatch(registerThunk({ name, email, password, userType })).unwrap();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Error is handled by Redux slice
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--fx-background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[var(--fx-surface)]/90 rounded-3xl border border-white/10 shadow-[0_28px_72px_rgba(0,0,0,0.6)] px-8 py-10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-[var(--fx-text-primary)] tracking-[0.2em] uppercase">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/40 p-4">
              <div className="text-sm text-red-300">
                {error}
              </div>
            </div>
          )}
          <div className="rounded-2xl space-y-4">
            <div className="relative">
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-white/15 bg-white/5 backdrop-blur placeholder-white/50 text-[var(--fx-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fx-accent)] focus:border-[var(--fx-accent)] focus:z-10 sm:text-sm transition"
                placeholder="Full Name"
              />
            </div>
            <div className="relative">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-white/15 bg-white/5 backdrop-blur placeholder-white/50 text-[var(--fx-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fx-accent)] focus:border-[var(--fx-accent)] focus:z-10 sm:text-sm transition"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-white/15 bg-white/5 backdrop-blur placeholder-white/50 text-[var(--fx-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fx-accent)] focus:border-[var(--fx-accent)] focus:z-10 sm:text-sm transition"
                placeholder="Password"
              />
            </div>
            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-white/15 bg-white/5 backdrop-blur placeholder-white/50 text-[var(--fx-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fx-accent)] focus:border-[var(--fx-accent)] focus:z-10 sm:text-sm transition"
                placeholder="Confirm Password"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--fx-text-secondary)] uppercase tracking-[0.2em] mb-2">
                User Type
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center text-[var(--fx-text-secondary)]">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-orange-500 focus:ring-orange-500 border-white/40"
                    name="userType"
                    value="user"
                    checked={userType === 'user'}
                    onChange={(e) => setUserType(e.target.value)}
                  />
                  <span className="ml-2">User</span>
                </label>
                <label className="inline-flex items-center text-[var(--fx-text-secondary)]">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-orange-500 focus:ring-orange-500 border-white/40"
                    name="userType"
                    value="admin"
                    checked={userType === 'admin'}
                    onChange={(e) => setUserType(e.target.value)}
                  />
                  <span className="ml-2">Admin</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <TailwindPrimaryButton type="submit" disabled={loading} fullWidth>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </TailwindPrimaryButton>
          </div>
        </form>
        <div className="text-sm text-center">
          <span className="text-[var(--fx-text-secondary)]">Already have an account? </span>
          <Link to="/login" className="font-medium text-[#212121] hover:bg-white/10 ">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupComponent;