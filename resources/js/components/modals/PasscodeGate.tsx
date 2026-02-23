import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PasscodeGateProps {
  onSuccess: () => void;
  onCancel: () => void;
  actionName: string;
}

type ForgotStep = 'email' | 'otp' | 'newPasscode' | 'done';

export const PasscodeGate: React.FC<PasscodeGateProps> = ({ onSuccess, onCancel, actionName }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Passcode check (reads from backend/env) ──
  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/passcode/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: input }),
      });
      if (response.ok) {
        onSuccess();
      } else {
        setError('Incorrect passcode');
        setInput('');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1: Send OTP to email ──
  const handleSendOtp = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setForgotError('');
    try {
      const response = await fetch('/api/passcode/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
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

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setForgotError('');
    try {
      const response = await fetch('/api/passcode/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const data = await response.json();
      if (response.ok) {
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

  // ── Step 3: Set new passcode ──
  const handleResetPasscode = async () => {
    if (newPasscode !== confirmPasscode) {
      setForgotError('Passcodes do not match.');
      return;
    }
    if (newPasscode.length < 4) {
      setForgotError('Passcode must be at least 4 characters.');
      return;
    }
    setLoading(true);
    setForgotError('');
    try {
      const response = await fetch('/api/passcode/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, newPasscode }),
      });
      const data = await response.json();
      if (response.ok) {
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
    setShowForgot(false);
    setForgotStep('email');
    setEmail('');
    setOtp('');
    setNewPasscode('');
    setConfirmPasscode('');
    setForgotError('');
  };

  // ────────────────────────────────────────────
  // FORGOT PASSCODE SCREENS
  // ────────────────────────────────────────────
  if (showForgot) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-sm">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-gray-900 dark:border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {forgotStep === 'email'      && 'Forgot Passcode'}
              {forgotStep === 'otp'        && 'Enter Reset Code'}
              {forgotStep === 'newPasscode'&& 'Set New Passcode'}
              {forgotStep === 'done'       && 'Passcode Updated'}
            </h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">

            {/* Step indicator */}
            {forgotStep !== 'done' && (
              <div className="flex items-center gap-2 mb-2">
                {['email', 'otp', 'newPasscode'].map((s, i) => (
                  <React.Fragment key={s}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      forgotStep === s
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : ['otp', 'newPasscode'].indexOf(forgotStep) > ['email', 'otp', 'newPasscode'].indexOf(s)
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 text-gray-400'
                    }`}>
                      {i + 1}
                    </div>
                    {i < 2 && <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-600" />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {forgotError && (
              <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-2xl p-3">
                <p className="text-red-700 dark:text-red-200 font-bold text-sm">{forgotError}</p>
              </div>
            )}

            {/* Step 1 — Email */}
            {forgotStep === 'email' && (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter the admin email address. A 6-digit reset code will be sent to it.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setForgotError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  placeholder="admin@yourcompany.com"
                  autoFocus
                  className="w-full px-4 py-2 border-2 border-gray-900 dark:border-gray-100 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendOtp}
                  disabled={loading || !email.trim()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </>
            )}

            {/* Step 2 — OTP */}
            {forgotStep === 'otp' && (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A 6-digit code was sent to <span className="font-bold text-gray-900 dark:text-white">{email}</span>. Enter it below.
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value); setForgotError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  autoFocus
                  className="w-full px-4 py-2 border-2 border-gray-900 dark:border-gray-100 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest font-bold"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  onClick={() => setForgotStep('email')}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  ← Back
                </button>
              </>
            )}

            {/* Step 3 — New Passcode */}
            {forgotStep === 'newPasscode' && (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a new passcode. Minimum 4 characters.
                </p>
                <input
                  type="password"
                  value={newPasscode}
                  onChange={(e) => { setNewPasscode(e.target.value); setForgotError(''); }}
                  placeholder="New passcode"
                  autoFocus
                  className="w-full px-4 py-2 border-2 border-gray-900 dark:border-gray-100 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  value={confirmPasscode}
                  onChange={(e) => { setConfirmPasscode(e.target.value); setForgotError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleResetPasscode()}
                  placeholder="Confirm new passcode"
                  className="w-full px-4 py-2 border-2 border-gray-900 dark:border-gray-100 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleResetPasscode}
                  disabled={loading || !newPasscode || !confirmPasscode}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save New Passcode'}
                </button>
              </>
            )}

            {/* Done */}
            {forgotStep === 'done' && (
              <>
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-400 rounded-2xl p-4 text-center">
                  <p className="text-green-700 dark:text-green-300 font-bold text-lg">✓ Passcode Updated!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Your new passcode has been saved successfully.
                  </p>
                </div>
                <button
                  onClick={resetForgotFlow}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-colors"
                >
                  Back to Login
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────
  // NORMAL PASSCODE SCREEN
  // ────────────────────────────────────────────
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-900 dark:border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Enter Passcode</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            A passcode is required to{' '}
            <span className="font-bold text-gray-900 dark:text-white">{actionName}</span>.
          </p>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-2xl p-3">
              <p className="text-red-700 dark:text-red-200 font-bold text-sm">{error}</p>
            </div>
          )}

          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter passcode"
            autoFocus
            className="w-full px-4 py-2 border-2 border-gray-900 dark:border-gray-100 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />

          <div className="text-right">
            <button
              onClick={() => setShowForgot(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot passcode?
            </button>
          </div>
        </div>

        <div className="flex gap-3 justify-center p-6 border-t-2 border-gray-900 dark:border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Confirm'}
          </button>
          <button
            onClick={onCancel}
            className="px-8 py-3 border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};