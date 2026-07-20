import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const fn = mode === 'login' ? login : register;
      const res = await fn(email, password);
      setSession(res.user, res.accessToken, res.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="flex justify-center py-20">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 border border-navy-100 rounded-lg p-8">
        <h1 className="font-display text-2xl text-navy-800 mb-2">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h1>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-navy-200 rounded px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-navy-200 rounded px-3 py-2"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-navy-800 text-white rounded py-2 hover:bg-navy-700">
          {mode === 'login' ? 'Sign in' : 'Register'}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full text-sm text-gold-600"
        >
          {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
