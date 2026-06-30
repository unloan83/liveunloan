import React, { useState } from 'react';
import { Mail, Key, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthCard({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.form) setErrors((prev) => ({ ...prev, [name]: '', form: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email address or admin username is required';
    else if (formData.email.trim().toLowerCase() !== 'admin' && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address or the admin username';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.user) {
        setErrors({ form: payload.error || 'Invalid email or password.' });
        return;
      }
      onLoginSuccess(payload.user);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-3xl blur opacity-30 group-hover:opacity-40 transition duration-1000"></div>
      <div className="relative glass-panel rounded-3xl p-8 flex flex-col">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
          <p className="text-sm text-gray-400">Login once to access your Unloan tools</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email ID or Admin Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-4 h-4" />
              </div>
              <input id="auth-email" name="email" type="text" autoComplete="username" value={formData.email} onChange={handleInputChange} placeholder="you@example.com or admin" className={`w-full bg-gray-950/60 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${errors.email ? 'border-red-500/50 focus:ring-red-500/30' : 'border-gray-800 focus:border-emerald-500/50'}`} />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Key className="w-4 h-4" />
              </div>
              <input id="auth-password" name="password" type="password" autoComplete="current-password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className={`w-full bg-gray-950/60 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${errors.password ? 'border-red-500/50 focus:ring-red-500/30' : 'border-gray-800 focus:border-emerald-500/50'}`} />
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>}
          </div>

          {errors.form && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{errors.form}</p>}

          <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Your password is verified securely and is never shown in the UI.</span>
          </div>

          <button id="auth-submit-btn" type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-70 text-gray-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer">
            <span>{isLoading ? 'Logging in...' : 'Access Dashboard'}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
