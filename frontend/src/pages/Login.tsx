import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/authApi';
import { useAuthStore } from '../store/authStore';


export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fn = mode === 'login' ? login : register;
      const res = await fn(email, password);
      setSession(res.user, res.accessToken, res.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 bg-itailor-dark relative overflow-hidden select-none">
      {/* Ambient Radial Backdrop Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-radial from-itailor-gold/10 via-itailor-cyan/5 to-transparent filter blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-md bg-itailor-card/70 border border-itailor-cardBorder rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10 flex flex-col gap-6">
        
        {/* Header Branding */}
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-itailor-gold via-yellow-400 to-itailor-cyan flex items-center justify-center text-itailor-dark font-black text-xl shadow-lg mb-3">
            N
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-itailor-gold uppercase tracking-wide">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs text-itailor-cream/60 mt-1">
            {mode === 'login'
              ? 'Sign in to access your bespoke suit designs & orders'
              : 'Register for custom measurements & order tracking'}
          </p>
        </div>

        {/* Mode Tab Switcher */}
        <div className="grid grid-cols-2 bg-[#070D16] p-1 rounded-xl border border-itailor-cardBorder">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'login'
                ? 'bg-itailor-gold text-itailor-dark shadow-md'
                : 'text-itailor-cream/60 hover:text-itailor-cream'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'register'
                ? 'bg-itailor-gold text-itailor-dark shadow-md'
                : 'text-itailor-cream/60 hover:text-itailor-cream'
            }`}
          >
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-itailor-cream uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-itailor-cream/40">👤</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexander Wright"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#070D16] border border-itailor-cardBorder rounded-xl pl-10 pr-4 py-3 text-sm text-itailor-cream placeholder:text-itailor-cream/30 focus:border-itailor-gold focus:ring-2 focus:ring-itailor-gold/20 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-itailor-cream uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-itailor-cream/40">✉️</span>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#070D16] border border-itailor-cardBorder rounded-xl pl-10 pr-4 py-3 text-sm text-itailor-cream placeholder:text-itailor-cream/30 focus:border-itailor-gold focus:ring-2 focus:ring-itailor-gold/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-itailor-cream uppercase tracking-wider">Password</label>
              {mode === 'login' && (
                <span className="text-[10px] text-itailor-gold/80 hover:text-itailor-gold cursor-pointer">
                  Forgot Password?
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-itailor-cream/40">🔒</span>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#070D16] border border-itailor-cardBorder rounded-xl pl-10 pr-4 py-3 text-sm text-itailor-cream placeholder:text-itailor-cream/30 focus:border-itailor-gold focus:ring-2 focus:ring-itailor-gold/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-itailor-red/20 border border-itailor-red/40 text-itailor-cream text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-itailor-cyan hover:bg-itailor-cyanHover text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-itailor-cyan/20 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating…' : mode === 'login' ? 'SIGN IN 🔒' : 'CREATE ACCOUNT 🚀'}
          </button>
        </form>

        {/* Footer Toggle Text */}
        <div className="text-center pt-2 border-t border-itailor-cardBorder/60">
          <p className="text-xs text-itailor-cream/60">
            {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="text-itailor-gold font-bold ml-1.5 hover:underline"
            >
              {mode === 'login' ? 'Register Now' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

