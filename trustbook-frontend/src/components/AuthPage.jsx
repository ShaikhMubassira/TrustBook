import { useState } from 'react';
import { FiBookOpen, FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!isLogin && !form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.name.trim(), form.email, form.password);
      }
    } catch (err) {
      const msg = err.response?.data?.message || (isLogin ? 'Login failed' : 'Registration failed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Left Panel — Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FiBookOpen className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">TrustBook</h1>
          </div>
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
            Your Smart<br />Financial Ledger
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-md">
            Track every credit and debit with precision. Get real-time insights, monthly statements, and complete control over your finances.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-10">
            {['Real-time Balance', 'Monthly Statements', 'Search & Filter', 'Secure & Private'].map((f) => (
              <span key={f} className="px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Decorative shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -left-16 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-12 w-40 h-40 bg-white/5 rounded-full" />
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
              <FiBookOpen className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">TrustBook</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer
                  ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer
                  ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Create Account
              </button>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              {isLogin ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {isLogin ? 'Sign in to access your ledger' : 'Create your TrustBook account'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name — only for signup */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Mubassira"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm text-slate-800 transition-all placeholder:text-slate-300"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm text-slate-800 transition-all placeholder:text-slate-300"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm text-slate-800 transition-all placeholder:text-slate-300"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-slate-300 mt-1">Minimum 6 characters</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer
                  bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg shadow-indigo-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <FiArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setForm({ name: '', email: '', password: '' }); }}
                  className="text-indigo-600 font-semibold hover:text-indigo-700 cursor-pointer"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-300 mt-6">
            Secure & encrypted. Your data is safe with TrustBook.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
