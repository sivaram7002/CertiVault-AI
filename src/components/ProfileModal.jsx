import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone,
  User, 
  Lock, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Eye,
  EyeOff,
  Award,
  KeyRound,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { 
  sendPhoneOtp,
  verifyPhoneOtp,
  sendGmailPasswordOtp,
  verifyGmailOtp,
  signOutProfile, 
  updateStoredProfile 
} from '../services/auth';

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  user, 
  onUserChange,
  certificates = [] 
}) {
  // Method: 'phone' | 'gmail'
  const [authMethod, setAuthMethod] = useState('phone');
  
  // Step: 'input' | 'otp'
  const [step, setStep] = useState('input');

  // Form Fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // OTP Demo Simulation Banner (shows the generated code so user can test seamlessly)
  const [simulatedOtpNotice, setSimulatedOtpNotice] = useState(null);
  const [countdown, setCountdown] = useState(300);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Editing state for logged-in user
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');

  // Timer countdown for OTP
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // 1. Send OTP Handler
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (authMethod === 'phone') {
        const res = await sendPhoneOtp(phoneNumber);
        setSimulatedOtpNotice(res.code);
        setStep('otp');
        setCountdown(300);
        setSuccessMessage(`OTP sent to ${res.target}! Enter the 6-digit code below.`);
      } else {
        const res = await sendGmailPasswordOtp({ email, password, name });
        setSimulatedOtpNotice(res.code);
        setStep('otp');
        setCountdown(300);
        setSuccessMessage(`Verification OTP sent to ${res.target}! Enter code to confirm.`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP Handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the full 6-digit OTP code.');
      setLoading(false);
      return;
    }

    try {
      let profile;
      if (authMethod === 'phone') {
        profile = await verifyPhoneOtp({
          phone: phoneNumber,
          otpCode,
          name
        });
      } else {
        profile = await verifyGmailOtp({
          email,
          otpCode,
          name
        });
      }

      onUserChange(profile);
      setSuccessMessage(`Identity verified! Welcome, ${profile.name}.`);
      setTimeout(() => {
        onClose();
        setStep('input');
        setOtpCode('');
        setSuccessMessage('');
        setSimulatedOtpNotice(null);
      }, 900);
    } catch (err) {
      setErrorMessage(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill simulated OTP
  const handleAutoFillOtp = () => {
    if (simulatedOtpNotice) {
      setOtpCode(simulatedOtpNotice);
    }
  };

  // Handle Logout
  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out? Your certificates will be securely locked from public view.')) {
      await signOutProfile();
      onUserChange(null);
      setIsEditing(false);
      setStep('input');
      setOtpCode('');
      onClose();
    }
  };

  // Handle Update Profile Name
  const handleSaveProfileEdit = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    const updated = updateStoredProfile({ name: editName.trim() });
    if (updated) {
      onUserChange(updated);
      setIsEditing(false);
      setSuccessMessage('Profile name updated successfully!');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  const userCerts = certificates;
  const verifiedCount = userCerts.filter(c => c.authenticityStatus === 'Verified Authentic').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {user ? 'Verified Profile & Security' : 'Secure Vault Authentication'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {user ? 'Private access to your certificates' : 'Phone Number or Gmail + Password with OTP'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              setStep('input');
              setErrorMessage('');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {user ? (
            /* ========================================================
               LOGGED IN STATE: Profile View & Vault Metrics
               ======================================================== */
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-4">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl border-2 border-indigo-500/40 object-cover shadow-md bg-slate-800"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-100 truncate">
                      {user.name}
                    </h3>
                    <span className="shrink-0 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" /> OTP Verified
                    </span>
                  </div>
                  
                  {user.phone && (
                    <p className="text-xs text-slate-300 truncate flex items-center gap-1.5 mt-0.5 font-mono">
                      <Phone className="w-3 h-3 text-sky-400 shrink-0" />
                      <span>{user.phone}</span>
                    </p>
                  )}

                  {user.email && !user.email.endsWith('@phone.certivault.local') && (
                    <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-red-400 shrink-0" />
                      <span className="font-mono text-[11px] text-slate-300 truncate">{user.email}</span>
                    </p>
                  )}

                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                    <span>Privacy: <strong className="text-emerald-400 font-semibold">Strict Owner Isolation</strong></span>
                  </div>
                </div>
              </div>

              {/* Edit Name Form */}
              {isEditing ? (
                <form onSubmit={handleSaveProfileEdit} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">Edit Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter full name"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Vault Credentials Overview */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <Award className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                  <div className="text-lg font-black font-mono text-slate-100">{userCerts.length}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Your Certificates</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-lg font-black font-mono text-emerald-400">{verifiedCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Authentic &amp; Sound</div>
                </div>
              </div>

              {/* Security Shield Notice */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <Lock className="w-3.5 h-3.5" /> 100% Private &amp; Isolated
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Only you have access to your uploaded documents. Unauthenticated visitors and other users cannot query or view your certificates.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(user.name);
                      setIsEditing(true);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold transition"
                  >
                    Edit Display Name
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="ml-auto px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Lock &amp; Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================
               LOGGED OUT STATE: Phone OTP or Gmail Password + OTP
               ======================================================== */
            <div className="space-y-4">
              {/* Method Switcher Tabs */}
              {step === 'input' && (
                <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('phone');
                      setErrorMessage('');
                    }}
                    className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                      authMethod === 'phone'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-sky-400" /> Phone + OTP
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('gmail');
                      setErrorMessage('');
                    }}
                    className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                      authMethod === 'gmail'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-red-400" /> Gmail + Password
                  </button>
                </div>
              )}

              {/* Status Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="leading-snug">{successMessage}</span>
                </div>
              )}

              {/* Simulated OTP floating confirmation alert */}
              {simulatedOtpNotice && step === 'otp' && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-indigo-500/15 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-amber-300 block">OTP Code Sent</span>
                    <span className="font-mono text-base font-black text-slate-100 tracking-widest">{simulatedOtpNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              )}

              {/* ========================================================
                  STEP 1: INPUT CREDENTIALS
                  ======================================================== */}
              {step === 'input' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {authMethod === 'phone' ? (
                    /* Phone Number Inputs */
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>Mobile Phone Number *</span>
                          <span className="text-[10px] text-slate-500">Includes country code</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <Phone className="w-4 h-4 text-sky-400" />
                          </div>
                          <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Full Name (Optional)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <User className="w-4 h-4 text-indigo-400" />
                          </div>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Sivaram Suresh"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Gmail + Password Inputs */
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Gmail Address *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <Mail className="w-4 h-4 text-red-400" />
                          </div>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="yourname@gmail.com"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>Password *</span>
                          <span className="text-[10px] text-slate-500">Min. 6 characters</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <Lock className="w-4 h-4 text-amber-400" />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Candidate Name (Optional)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <User className="w-4 h-4 text-indigo-400" />
                          </div>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Sivaram Suresh"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Two-Factor OTP Required
                    </span>
                    <p className="text-slate-500 leading-snug">
                      To ensure your documents remain 100% private and inaccessible to anyone else, an OTP code confirmation will be required.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating OTP Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send 6-Digit OTP Confirmation</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ========================================================
                  STEP 2: OTP CONFIRMATION SCREEN
                  ======================================================== */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-indigo-400">
                      <KeyRound className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-200">Enter OTP Confirmation</h3>
                    <p className="text-[11px] text-slate-400">
                      A 6-digit confirmation code was dispatched for{' '}
                      <strong className="text-slate-200 font-mono">
                        {authMethod === 'phone' ? phoneNumber : email}
                      </strong>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block text-center">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>
                      Expires in: <strong className="text-amber-400 font-mono">{Math.floor(countdown / 60)}:{('0' + (countdown % 60)).slice(-2)}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep('input')}
                      className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" /> Change details
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying OTP &amp; Unlocking...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm OTP &amp; Unlock Private Vault</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
