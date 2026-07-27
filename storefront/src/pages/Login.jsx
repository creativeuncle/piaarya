import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { GoogleIcon, AppleIcon } from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';
import { forgotPassword, requestOtp } from '../api/auth';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { login, loginWithOtp } = useAuth();

  const [mode, setMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [otpStatusMessage, setOtpStatusMessage] = useState('');
  const [forgotMessage, setForgotMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await requestOtp(email);
      setOtpSent(true);
      setDevOtp(data.otp);
      setOtpStatusMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithOtp(email, otp);
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email above first');
      return;
    }
    setForgotMessage(null);
    try {
      const data = await forgotPassword(email);
      setForgotMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h1>

      {error && <p className="text-sm text-red-600 mb-4 text-center">{error}</p>}

      {mode === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <Field label="Email">
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <button type="button" onClick={handleForgotPassword} className="text-sm text-gray-600 underline">
            Forgot password?
          </button>
          {forgotMessage && <p className="text-xs text-green-600">{forgotMessage}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-semibold py-3 rounded-md disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}

      {mode === 'otp' && (
        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
          <Field label="Email">
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent}
              required
            />
          </Field>
          {otpSent && (
            <Field label="OTP">
              <input type="text" className="input" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              {otpStatusMessage && (
                <p className="text-xs text-gray-400 mt-1">
                  {otpStatusMessage} {devOtp && <strong>{devOtp}</strong>}
                </p>
              )}
            </Field>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-semibold py-3 rounded-md disabled:opacity-50"
          >
            {loading ? 'Please wait...' : otpSent ? 'Verify & Login' : 'Send OTP'}
          </button>
        </form>
      )}

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setMode(mode === 'password' ? 'otp' : 'password')}
          className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-md text-sm"
        >
          {mode === 'password' ? 'Login with OTP' : 'Login with Password'}
        </button>
        <button
          type="button"
          onClick={() => alert('Google login is coming soon — needs Google OAuth credentials.')}
          className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-md text-sm flex items-center justify-center gap-2"
        >
          <HugeiconsIcon icon={GoogleIcon} size={18} strokeWidth={1.5} />
          Login with Google
        </button>
        <button
          type="button"
          onClick={() => alert('Apple login is coming soon — needs Sign in with Apple credentials.')}
          className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-md text-sm flex items-center justify-center gap-2"
        >
          <HugeiconsIcon icon={AppleIcon} size={18} strokeWidth={1.5} />
          Login with Apple
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center mt-6">
        Don't have an account?{' '}
        <Link to={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="text-gray-900 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
