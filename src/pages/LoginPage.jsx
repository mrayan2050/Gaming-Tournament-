import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiPhone, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { GiGamepad } from 'react-icons/gi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle, sendMobileOTP, verifyMobileOTP } from '../services/authService';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [step, setStep] = useState('input'); // 'input' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // ── Flow: Enter Mobile → Firebase sends OTP ──────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) { toast.error('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      const result = await sendMobileOTP(phone); // Firebase triggers SMS here
      setConfirmationResult(result);
      setStep('otp');
      toast.success('OTP sent to your mobile number');
    } catch (err) {
      console.error(err);
      toast.error(err.message?.includes('too-many-requests')
        ? 'Too many attempts. Try again later.'
        : 'Failed to send OTP. Check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleOTPKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  // ── Flow: Verify OTP → Backend creates user → JWT Token ─────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      // verifyMobileOTP: confirms with Firebase, then exchanges Firebase
      // ID token for our backend JWT (backend creates user if new).
      const { user, wallet } = await verifyMobileOTP(confirmationResult, entered);
      login({ user, wallet });
      toast.success('Welcome to BattleArena! 🎮');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error('Incorrect or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Flow: Continue with Google → popup → Backend → create/find user → JWT ──
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { user, wallet } = await loginWithGoogle();
      login({ user, wallet });
      toast.success(`Welcome, ${user.name?.split(' ')[0] || 'Player'}! 🎮`);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        toast.error('Google sign-in was cancelled');
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      {/* Required invisible container for Firebase reCAPTCHA (Phone Auth) */}
      <div id="recaptcha-container" />

      <div className="relative w-full max-w-md">
        <div className="bg-dark-800 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <GiGamepad className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-white">
                Battle<span className="text-gradient">Arena</span>
              </span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-white">
              {step === 'input' ? 'Login or Sign Up' : 'Verify OTP'}
            </h1>
            <p className="text-gray-400 text-sm mt-1.5">
              {step === 'input'
                ? 'Enter your mobile number to continue'
                : `OTP sent to +91 ${phone}`}
            </p>
          </div>

          {step === 'input' ? (
            <>
              {/* Phone form */}
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-medium">Mobile Number</label>
                  <div className="flex">
                    <div className="flex items-center gap-1.5 px-3 bg-dark-700 border border-r-0 border-white/10 rounded-l-xl text-sm text-gray-400">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit number"
                      className="flex-1 px-4 py-3 bg-dark-700 border border-white/10 rounded-r-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/60"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <span className="spinner !w-5 !h-5 !border-2" /> : (
                    <><FiPhone className="w-4 h-4" /> Send OTP <FiArrowRight /></>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-500">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-60"
              >
                <FcGoogle className="w-5 h-5" />
                Continue with Google
              </button>

              <p className="text-xs text-gray-500 text-center mt-5 leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="#" className="text-orange-400 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-orange-400 hover:underline">Privacy Policy</a>. Must be 18+.
              </p>
            </>
          ) : (
            /* OTP form */
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-xs text-gray-400 mb-3 font-medium">Enter 6-Digit OTP</label>
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="tel"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOTPChange(e.target.value, idx)}
                      onKeyDown={e => handleOTPKeyDown(e, idx)}
                      className="w-12 h-12 text-center text-xl font-bold bg-dark-700 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/60 focus:bg-dark-600 transition-colors"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3.5 disabled:opacity-60"
              >
                {loading ? <span className="spinner !w-5 !h-5 !border-2" /> : 'Verify & Continue →'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('input'); setOtp(['','','','','','']); }}
                className="w-full text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" /> Change number
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
