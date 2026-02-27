import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/themetoggle';
import { useAppearance } from '../hooks/use-appearance';

type ForgotStep = 'confirm' | 'otp' | 'newPasscode' | 'done';
type View = 'login' | 'forgot';

const Login: React.FC = () => {
  const { resolvedAppearance } = useAppearance();
  const isDark = resolvedAppearance === 'dark';

  // ── Login state ──
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Forgot state ──
  const [view, setView] = useState<View>('login');
  const [forgotStep, setForgotStep] = useState<ForgotStep>('confirm');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // ────────────────────────────────────────────────────────
  // LOGIC (UNTOUCHED)
  // ────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email.trim() || !passcode.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passcode }),
      });
      if (res.ok) {
        router.visit('/');
      } else {
        const data = await res.json();
        setError(data.message || 'Invalid email or passcode.');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setForgotError('');
    try {
      const res = await fetch('/api/passcode/forgot-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setMaskedEmail(data.maskedEmail ?? '');
        setForgotStep('otp');
      } else {
        setForgotError(data.message || 'Failed to send code.');
      }
    } catch {
      setForgotError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setForgotError('');
    try {
      const res = await fetch('/api/passcode/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotStep('newPasscode');
      } else {
        setForgotError(data.message || 'Invalid code.');
      }
    } catch {
      setForgotError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasscode = async () => {
    if (newPasscode !== confirmPass) { setForgotError('Passcodes do not match.'); return; }
    if (newPasscode.length < 4) { setForgotError('Passcode must be at least 4 characters.'); return; }
    setLoading(true);
    setForgotError('');
    try {
      const res = await fetch('/api/passcode/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, newPasscode }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotStep('done');
      } else {
        setForgotError(data.message || 'Failed to reset passcode.');
      }
    } catch {
      setForgotError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForgotFlow = () => {
    setView('login');
    setForgotStep('confirm');
    setMaskedEmail('');
    setOtp('');
    setNewPasscode('');
    setConfirmPass('');
    setForgotError('');
    setShowNew(false);
    setShowConfirm(false);
  };

  // ────────────────────────────────────────────────────────
  // SHARED STYLES
  // ────────────────────────────────────────────────────────
  const cardClasses = `relative z-10 w-full max-w-md p-8 rounded-3xl border-2 backdrop-blur-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${
    isDark 
      ? 'bg-slate-900/50 border-slate-800' 
      : 'bg-white/80 border-gray-200 shadow-2xl'
  }`;

  const inputClasses = `w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
    isDark 
      ? 'bg-slate-950/50 border-slate-800 focus:border-green-500 text-white' 
      : 'bg-gray-50 border-gray-200 focus:border-green-500 text-slate-900'
  }`;

  const buttonPrimary = `w-full py-3.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-wider transition-all transform active:scale-95 shadow-lg shadow-green-500/20`;

  // ────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-700 relative overflow-hidden ${
      isDark 
        ? 'bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black' 
        : 'bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white via-gray-100 to-gray-200'
    }`}>
      <Head title={view === 'login' ? 'Admin Login' : 'Reset Passcode'} />
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Header Section */}
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className={cardClasses}>
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center border-2 mb-4 transition-all duration-500 ${
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-100 shadow-inner'
          }`}>
            <img src="/ALL.png" alt="Shared Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {view === 'login' ? 'Admin Access' : 'Security Reset'}
          </h1>
          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {view === 'login' ? 'Please sign in to your account' : 'Follow the steps to recover access'}
          </p>
        </div>

        {/* ── FORGOT VIEW ── */}
        {view === 'forgot' ? (
          <div className="space-y-5">
             {/* Progress Dots */}
             {forgotStep !== 'done' && (
                <div className="flex justify-center gap-2 mb-4">
                    {(['confirm', 'otp', 'newPasscode'] as ForgotStep[]).map((s) => (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${
                            forgotStep === s ? 'w-8 bg-green-500' : 'w-2 bg-gray-300 dark:bg-slate-700'
                        }`} />
                    ))}
                </div>
            )}

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold text-center">
                {forgotError}
              </div>
            )}

            {forgotStep === 'confirm' && (
              <>
                <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    A 6-digit reset code will be sent to the admin email.
                </p>
                <button onClick={handleSendOtp} disabled={loading} className={buttonPrimary}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </>
            )}

            {forgotStep === 'otp' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    placeholder="000000"
                    className={`${inputClasses} text-center text-2xl tracking-[0.5em] font-black`}
                  />
                </div>
                <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6} className={buttonPrimary}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </>
            )}

            {forgotStep === 'newPasscode' && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="New Passcode"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    className={inputClasses}
                  />
                   <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm Passcode"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className={inputClasses}
                  />
                   <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <button onClick={handleResetPasscode} disabled={loading} className={buttonPrimary}>
                  {loading ? 'Updating...' : 'Update Passcode'}
                </button>
              </div>
            )}

            {forgotStep === 'done' && (
                <div className="text-center space-y-4">
                    <div className="text-green-500 font-bold">Success! Passcode updated.</div>
                    <button onClick={resetForgotFlow} className={buttonPrimary}>Back to Login</button>
                </div>
            )}

            {forgotStep !== 'done' && (
                <button onClick={resetForgotFlow} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-green-500 transition-colors">
                    <ArrowLeft size={16} /> Back to Login
                </button>
            )}
          </div>
        ) : (
          /* ── LOGIN VIEW ── */
          <div className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Passcode</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className={inputClasses}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => setView('forgot')}
                className="text-xs font-bold text-green-500 hover:text-green-600 transition-colors"
              >
                Forgot Passcode?
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !email || !passcode}
              className={buttonPrimary}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                   Logging in...
                </span>
              ) : 'Sign In'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;