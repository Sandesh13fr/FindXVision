import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TailwindPrimaryButton from '../../components/Common/TailwindPrimaryButton';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setMessage('Your password has been reset successfully!');
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--fx-background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[var(--fx-surface)]/90 rounded-3xl border border-white/10 shadow-[0_28px_72px_rgba(0,0,0,0.6)] px-8 py-10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-[var(--fx-text-primary)] tracking-[0.2em] uppercase">
            Set new password
          </h2>
          <p className="mt-4 text-center text-sm text-[var(--fx-text-secondary)]">
            Please enter your new password below.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div
              className={`rounded-md p-4 border ${
                message.includes('success')
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-500/10 border-red-500/40 text-red-200'
              }`}
            >
              <div className="text-sm">
                {message}
              </div>
            </div>
          )}
          <div className="rounded-2xl space-y-4">
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-white/15 bg-white/5 backdrop-blur placeholder-white/50 text-[var(--fx-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fx-accent)] focus:border-[var(--fx-accent)] focus:z-10 sm:text-sm transition"
                placeholder="New Password"
              />
            </div>
            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-white/15 bg-white/5 backdrop-blur placeholder-white/50 text-[var(--fx-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fx-accent)] focus:border-[var(--fx-accent)] focus:z-10 sm:text-sm transition"
                placeholder="Confirm New Password"
              />
            </div>
          </div>

          <div>
            <TailwindPrimaryButton
              type="submit"
              disabled={loading}
              fullWidth
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </TailwindPrimaryButton>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-[var(--fx-accent)] hover:text-[#ffab33]">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;