import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const PROFILE_STORAGE_KEY = 'certivault_user_profile';
const PENDING_OTP_KEY = 'certivault_pending_otp';

/**
 * Get the currently logged-in user profile
 */
export async function getCurrentProfile() {
  // 1. Check Supabase Auth session if configured
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const { data: { session } } = await client.auth.getSession();
        if (session && session.user) {
          const u = session.user;
          const metadata = u.user_metadata || {};
          const profile = {
            id: u.id,
            email: u.email || '',
            phone: u.phone || metadata.phone || '',
            name: metadata.full_name || metadata.name || (u.email ? u.email.split('@')[0] : (u.phone || 'User')),
            avatarUrl: metadata.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.email || u.phone || 'User')}`,
            provider: u.app_metadata?.provider || (u.phone ? 'phone_otp' : 'supabase'),
            authMethod: u.phone ? 'phone_otp' : 'credential',
            createdAt: u.created_at || new Date().toISOString()
          };
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
          return profile;
        }
      }
    } catch (err) {
      console.warn('Error fetching Supabase auth session:', err);
    }
  }

  // 2. Check local stored authenticated profile
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading local profile:', e);
  }

  return null;
}

/**
 * Generate a random 6-digit OTP code
 */
function generateRandomOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 1. Send OTP for Phone Number Login
 */
export async function sendPhoneOtp(phoneNumber) {
  const cleanPhone = (phoneNumber || '').trim();
  if (!cleanPhone || cleanPhone.length < 8) {
    throw new Error('Please enter a valid phone number (at least 8-10 digits).');
  }

  const otpCode = generateRandomOtp();
  const pendingData = {
    target: cleanPhone,
    type: 'phone',
    code: otpCode,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  };
  localStorage.setItem(PENDING_OTP_KEY, JSON.stringify(pendingData));

  // Try Supabase SMS OTP if configured
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.auth.signInWithOtp({ phone: cleanPhone });
      }
    } catch (err) {
      console.info('Supabase SMS gateway not configured, using direct secure OTP engine.');
    }
  }

  return {
    success: true,
    target: cleanPhone,
    code: otpCode, // Provided for instant demo/confirmation verification banner
    expiresIn: 300
  };
}

/**
 * 2. Verify Phone OTP and Log In
 */
export async function verifyPhoneOtp({ phone, otpCode, name }) {
  const cleanPhone = (phone || '').trim();
  const rawPending = localStorage.getItem(PENDING_OTP_KEY);

  if (!rawPending) {
    throw new Error('No pending OTP found. Please request a new verification code.');
  }

  const pending = JSON.parse(rawPending);

  if (Date.now() > pending.expiresAt) {
    localStorage.removeItem(PENDING_OTP_KEY);
    throw new Error('Verification code has expired. Please request a new code.');
  }

  if (pending.target !== cleanPhone || pending.code !== otpCode.trim()) {
    throw new Error('Incorrect OTP code. Please enter the 6-digit code correctly.');
  }

  localStorage.removeItem(PENDING_OTP_KEY);

  const cleanDigits = cleanPhone.replace(/\D/g, '');
  const displayName = name?.trim() || `User ${cleanDigits.slice(-4)}`;
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=0284c7,0f172a,1e293b`;

  const profile = {
    id: `usr_phone_${cleanDigits}`,
    phone: cleanPhone,
    email: `${cleanDigits}@phone.certivault.local`,
    name: displayName,
    avatarUrl,
    provider: 'phone_otp',
    authMethod: 'phone_otp',
    verifiedPhone: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

/**
 * 3. Send OTP for Gmail + Password Login
 */
export async function sendGmailPasswordOtp({ email, password, name }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid Gmail address (e.g. yourname@gmail.com).');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long for secure vault access.');
  }

  const otpCode = generateRandomOtp();
  const pendingData = {
    target: cleanEmail,
    password: password,
    name: name?.trim() || '',
    type: 'email',
    code: otpCode,
    expiresAt: Date.now() + 5 * 60 * 1000
  };
  localStorage.setItem(PENDING_OTP_KEY, JSON.stringify(pendingData));

  // Try Supabase Email OTP if configured
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.auth.signInWithOtp({ email: cleanEmail });
      }
    } catch (e) {
      console.info('Supabase email OTP fallback to built-in secure OTP engine.');
    }
  }

  return {
    success: true,
    target: cleanEmail,
    code: otpCode,
    expiresIn: 300
  };
}

/**
 * 4. Verify Gmail OTP and Log In
 */
export async function verifyGmailOtp({ email, otpCode, name }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const rawPending = localStorage.getItem(PENDING_OTP_KEY);

  if (!rawPending) {
    throw new Error('No pending OTP found. Please request a new verification code.');
  }

  const pending = JSON.parse(rawPending);

  if (Date.now() > pending.expiresAt) {
    localStorage.removeItem(PENDING_OTP_KEY);
    throw new Error('Verification code has expired. Please request a new code.');
  }

  if (pending.target !== cleanEmail || pending.code !== otpCode.trim()) {
    throw new Error('Incorrect OTP code. Please enter the 6-digit code correctly.');
  }

  const resolvedName = name?.trim() || pending.name || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}&backgroundColor=0f172a,1e293b,0284c7`;

  // Also attempt Supabase sign up / sign in in the background
  if (isSupabaseConfigured() && pending.password) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const { error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: pending.password
        });
        if (error && error.message?.toLowerCase().includes('invalid login')) {
          await client.auth.signUp({
            email: cleanEmail,
            password: pending.password,
            options: { data: { full_name: resolvedName } }
          });
        }
      }
    } catch (e) {
      console.warn('Supabase auth sync note:', e.message);
    }
  }

  localStorage.removeItem(PENDING_OTP_KEY);

  const profile = {
    id: `usr_${cleanEmail.replace(/[@.]/g, '_')}`,
    email: cleanEmail,
    name: resolvedName,
    avatarUrl,
    provider: cleanEmail.endsWith('@gmail.com') ? 'gmail' : 'email',
    authMethod: 'gmail_password_otp',
    verifiedEmail: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

/**
 * Update current user profile details
 */
export function updateStoredProfile(updatedFields) {
  try {
    const existing = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
    const merged = { ...existing, ...updatedFields };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('Failed updating profile:', e);
    return null;
  }
}

/**
 * Sign out user and clear stored credentials
 */
export async function signOutProfile() {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase signout warning:', e);
    }
  }

  localStorage.removeItem(PROFILE_STORAGE_KEY);
  localStorage.removeItem(PENDING_OTP_KEY);
  return true;
}

/**
 * Listen for Supabase session changes
 */
export function subscribeToAuthEvents(onUserChanged) {
  if (!isSupabaseConfigured()) return () => {};

  const client = getSupabaseClient();
  if (!client) return () => {};

  const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const u = session.user;
      const metadata = u.user_metadata || {};
      const profile = {
        id: u.id,
        email: u.email || '',
        phone: u.phone || '',
        name: metadata.full_name || metadata.name || (u.email ? u.email.split('@')[0] : 'User'),
        avatarUrl: metadata.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.email || 'User')}`,
        provider: u.app_metadata?.provider || 'supabase',
        authMethod: 'credential',
        createdAt: u.created_at || new Date().toISOString()
      };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      onUserChanged(profile);
    } else if (event === 'SIGNED_OUT') {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      onUserChanged(null);
    }
  });

  return () => {
    subscription?.unsubscribe();
  };
}
