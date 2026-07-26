import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { GoogleIcon, AppleIcon } from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { signup } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h1>

      {error && <p className="text-sm text-red-600 mb-4 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </Field>
        <Field label="Email">
          <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} required />
        </Field>
        <Field label="Phone">
          <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <Field label="Password">
          <input
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            minLength={6}
            required
          />
        </Field>
        <Field label="Confirm Password">
          <input
            type="password"
            className="input"
            value={form.confirmPassword}
            onChange={(e) => set('confirmPassword', e.target.value)}
            minLength={6}
            required
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white font-semibold py-3 rounded-md disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-4">
        Already have an account?{' '}
        <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-gray-900 underline">
          Login
        </Link>
      </p>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => alert('Google signup is coming soon — needs Google OAuth credentials.')}
          className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-md text-sm flex items-center justify-center gap-2"
        >
          <HugeiconsIcon icon={GoogleIcon} size={18} strokeWidth={1.5} />
          Signup with Google
        </button>
        <button
          type="button"
          onClick={() => alert('Apple signup is coming soon — needs Sign in with Apple credentials.')}
          className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-md text-sm flex items-center justify-center gap-2"
        >
          <HugeiconsIcon icon={AppleIcon} size={18} strokeWidth={1.5} />
          Signup with Apple
        </button>
      </div>
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
