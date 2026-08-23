import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  KeyRound, 
  User,
  Eye, 
  EyeOff, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { AuthService } from '../services/authService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  darkMode: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  darkMode,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result = AuthService.login(username, password);
      setLoading(false);

      if (result.success) {
        setUsername('');
        setPassword('');
        onSuccess();
      } else {
        setError(result.error || 'ভুল ইউজারনেম অথবা পাসওয়ার্ড!');
      }
    }, 200);
  };

  const handleUseDefaultCredentials = () => {
    AuthService.resetCredentialsToDefault();
    setUsername('admin');
    setPassword('admin');
    setError(null);
  };

  const handleInstantResetAndLogin = () => {
    AuthService.resetCredentialsToDefault();
    setUsername('admin');
    setPassword('admin');
    setError(null);
    onSuccess();
  };

  return (
    <div 
      id="admin-login-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden"
    >
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden animate-fade-in ${
        darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between gap-4 ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">অ্যাডমিন প্যানেল লগইন</h2>
              <p className="text-xs text-slate-400">Admin Studio Authentication</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              darkMode ? 'border-slate-800 bg-slate-800 text-slate-300 hover:text-white' : 'border-slate-300 bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          
          {/* Username Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              ইউজারনেম / Admin Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                autoFocus
                placeholder="ইউজারনেম লিখুন (e.g. admin)..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm border outline-none transition-all ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' 
                    : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              অ্যাডমিন পাসওয়ার্ড / Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="পাসওয়ার্ড লিখুন..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full pl-10 pr-10 py-3 rounded-2xl text-sm border outline-none transition-all ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' 
                    : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error feedback with Recovery Action */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs space-y-2 animate-fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              <div className="pt-2 border-t border-red-500/20 flex items-center justify-between">
                <span className="text-[11px] text-slate-300">লগইন করতে সমস্যা হচ্ছে?</span>
                <button
                  type="button"
                  onClick={handleInstantResetAndLogin}
                  className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  ⚡ সরাসরি আনলক ও রিসেট করুন
                </button>
              </div>
            </div>
          )}

          {/* Default credentials hint */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            darkMode ? 'bg-indigo-950/30 border-indigo-500/20 text-slate-300' : 'bg-indigo-50/80 border-indigo-200 text-slate-700'
          }`}>
            <div className="space-y-0.5">
              <p className="font-semibold text-indigo-400">
                ইউজার: <code className="px-1.5 py-0.5 rounded bg-indigo-900/60 font-mono text-white">admin</code> | পাস: <code className="px-1.5 py-0.5 rounded bg-indigo-900/60 font-mono text-white">admin</code>
              </p>
              <p className="text-[11px] text-slate-400">ড্যাশবোর্ড খোলার পর সিকিউরিটি ট্যাব থেকে দুটোই বদলাতে পারবেন।</p>
            </div>
            <button
              type="button"
              onClick={handleUseDefaultCredentials}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline shrink-0 cursor-pointer"
            >
              স্বয়ংক্রিয় বসান
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন / Unlock Studio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

      </div>
    </div>
  );
};
