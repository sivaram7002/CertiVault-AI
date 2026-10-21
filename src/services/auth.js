import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const PROFILE_STORAGE_KEY = 'certivault_user_profile';

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
            name: metadata.full_name || metadata.name || (u.email ? u.email.split('@')[0] : 'CertiVault User'),
            avatarUrl: metadata.avatar_url || metadata.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.email || 'User')}`,
            provider: u.app_metadata?.provider || 'google',
            authMethod: 'supabase_oauth',
            createdAt: u.created_at || new Date().toISOString()
          };
          // Keep local profile in sync
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
          return profile;
        }
      }
    } catch (err) {
      console.warn('Error fetching Supabase auth session:', err);
    }
  }

  // 2. Check local stored Gmail profile
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
 * Log in with Gmail credentials (Email & Name)
 */
export async function loginWithGmailCredentials({ email, name, avatarUrl }) {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid Gmail or email address.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const displayName = name?.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const defaultAvatar = avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=0f172a,1e293b,0284c7`;

  const profile = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    name: displayName,
    avatarUrl: defaultAvatar,
    provider: cleanEmail.endsWith('@gmail.com') ? 'gmail' : 'email',
    authMethod: 'credential',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

/**
 * Trigger Supabase Google OAuth Redirect
 */
export async function signInWithGoogleOAuth() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured.');
  }

  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });

  if (error) {
    throw new Error(`Google OAuth error: ${error.message}`);
  }

  return data;
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
  return true;
}

/**
 * Listen for Supabase OAuth redirect or session changes
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
        name: metadata.full_name || metadata.name || (u.email ? u.email.split('@')[0] : 'User'),
        avatarUrl: metadata.avatar_url || metadata.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.email || 'User')}`,
        provider: u.app_metadata?.provider || 'google',
        authMethod: 'supabase_oauth',
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
