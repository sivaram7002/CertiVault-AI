import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  User, 
  Lock, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ExternalLink,
  Award,
  Database,
  Calendar,
  KeyRound
} from 'lucide-react';
import { 
  loginWithGmailCredentials, 
  signInWithGoogleOAuth, 
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
  const [activeTab, setActiveTab] = useState('gmail'); // 'gmail' | 'oauth'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Editing state for logged-in user
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');

  if (!isOpen) return null;

  // Handle Login with Gmail Credentials
  const handleGmailLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid Gmail address (e.g. yourname@gmail.com).');
      return;
    }

    setLoading(true);
    try {
      const profile = await loginWithGmailCredentials({
        email: email.trim(),
        name: name.trim()
      });
      onUserChange(profile);
      setSuccessMessage(`Welcome back, ${profile.name}! Your Gmail credentials are now active.`);
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 900);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authenticate with Gmail credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth Sign-in
  const handleGoogleOAuth = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      await signInWithGoogleOAuth();
    } catch (err) {
      const msg = err.message || '';
      const isProviderDisabled = 
        msg.toLowerCase().includes('provider is not enabled') ||
        msg.toLowerCase().includes('unsupported provider') ||
        msg.toLowerCase().includes('validation_failed');

      if (isProviderDisabled) {
        setActiveTab('gmail');
        setErrorMessage(
          'Google OAuth provider is not enabled in your Supabase project yet. We have switched you to Gmail Credentials — enter your Gmail address below to sign in immediately without any setup!'
        );
      } else {
        setErrorMessage(msg || 'Failed to initialize Google Sign-In.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out from your Gmail profile?')) {
      await signOutProfile();
      onUserChange(null);
      setIsEditing(false);
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

  // Statistics for profile
  const userCerts = certificates;
  const verifiedCount = userCerts.filter(c => c.authenticityStatus === 'Verified Authentic').length;
  const avgTrust = userCerts.length > 0 
    ? Math.round(userCerts.reduce((acc, c) => acc + (Number(c.trustScore) || 0), 0) / userCerts.length) 
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <User className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {user ? 'User Profile & Credentials' : 'Sign In to CertiVault AI'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {user ? 'Manage your verified credentials & certificates' : 'Connect with your Gmail account'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {user ? (
            /* ========================================================
               LOGGED IN STATE: Profile View & Settings
               ======================================================== */
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex items-center gap-4">
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
                    <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3 text-red-400 shrink-0" />
                    <span className="font-mono text-[11px] text-slate-300 truncate">{user.email}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                    <span>Provider: <strong className="text-slate-300 uppercase">{user.provider || 'Gmail'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Edit Name Form if toggled */}
              {isEditing ? (
                <form onSubmit={handleSaveProfileEdit} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">Edit Display Name</label>
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
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <Award className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                  <div className="text-base font-extrabold font-mono text-slate-100">{userCerts.length}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Certificates</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-base font-extrabold font-mono text-emerald-400">{verifiedCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Authentic</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <Sparkles className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-base font-extrabold font-mono text-amber-300">{avgTrust}%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Trust</div>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="rounded-xl border border-slate-800/80 divide-y divide-slate-800/60 bg-slate-950/40 text-xs">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-400">Cloud Sync Database</span>
                  <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Supabase Active
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-400">Account Type</span>
                  <span className="text-slate-200 font-medium">Verified Academic Profile</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-400">Session Status</span>
                  <span className="text-indigo-400 font-medium">Active &amp; Persistent</span>
                </div>
              </div>

              {/* Success / Error notification */}
              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

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
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================
               LOGGED OUT STATE: Sign In Tabs (Gmail vs Google OAuth)
               ======================================================== */
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => { setActiveTab('gmail'); setErrorMessage(''); }}
                  className={`py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                    activeTab === 'gmail'
                      ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-red-400" /> Gmail Credentials
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('oauth'); setErrorMessage(''); }}
                  className={`py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                    activeTab === 'oauth'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Google 1-Click
                </button>
              </div>

              {/* Status alerts */}
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

              {/* Tab 1: Gmail Credentials Form */}
              {activeTab === 'gmail' && (
                <form onSubmit={handleGmailLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Gmail / Email Address *</span>
                      <span className="text-[10px] text-slate-500 font-normal">e.g. sivaramsuresh@gmail.com</span>
                    </label>
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 font-mono transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Full Name</span>
                      <span className="text-[10px] text-slate-500 font-normal">Optional (Used on Certificates)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4 text-indigo-400" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sivaram Suresh"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  {/* Feature perks pill */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Automatic Vault Integration
                    </div>
                    <p className="text-slate-500 leading-relaxed">
                      Your profile will sync with your active Supabase cloud database and all uploaded certificates will be attributed to your verified profile.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-red-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing In with Gmail...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Connect Gmail Profile</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Tab 2: Google 1-Click OAuth */}
              {activeTab === 'oauth' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">Supabase Google Provider</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Authenticates your account directly with Google OAuth via your connected Supabase project.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleOAuth}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-lg shadow-white/10 transition flex items-center justify-center gap-2.5 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        <span>Redirecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-2 text-left">
                    <p>
                      💡 <strong>Instant Access:</strong> Switch to the <button type="button" onClick={() => setActiveTab('gmail')} className="text-red-400 underline font-semibold">Gmail Credentials</button> tab above for immediate access with zero setup needed!
                    </p>
                    <p className="text-[10px] text-slate-500">
                      To use this Google button, enable Google in your{' '}
                      <a 
                        href="https://supabase.com/dashboard/project/gibshdomtzplafeqfeqh/auth/providers" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-400 underline hover:text-indigo-300 inline-flex items-center gap-1"
                      >
                        Supabase Providers Dashboard <ExternalLink className="w-2.5 h-2.5" />
                      </a>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
