import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'certivault_supabase_url';
const STORAGE_KEY_KEY = 'certivault_supabase_anon_key';

let cachedClient = null;
let cachedClientUrl = null;
let cachedClientKey = null;

/**
 * 1-Click SQL Schema for Supabase SQL Editor
 */
export const SUPABASE_SCHEMA_SQL = `-- ========================================================
-- CertiVault AI - Supabase Database Schema
-- Run this in your Supabase Dashboard: SQL Editor -> New Query
-- ========================================================

-- 1. Create Certificates Table to store metadata and documents
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  student_name TEXT,
  platform TEXT,
  course_title TEXT,
  total_duration TEXT,
  date_of_completion TEXT,
  issue_date TEXT,
  credential_id TEXT,
  verification_url TEXT,
  category TEXT DEFAULT 'Course',
  skills JSONB DEFAULT '[]'::jsonb,
  internship_details JSONB,
  qr_code_data JSONB,
  authenticity_status TEXT DEFAULT 'Verified Authentic',
  trust_score NUMERIC DEFAULT 95,
  forensic_summary TEXT,
  forensic_checklist JSONB,
  file_data TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 3. Create Public Policies (Allows anonymous app access using anon key)
DROP POLICY IF EXISTS "Allow public read access" ON public.certificates;
CREATE POLICY "Allow public read access" ON public.certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON public.certificates;
CREATE POLICY "Allow public insert access" ON public.certificates FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON public.certificates;
CREATE POLICY "Allow public update access" ON public.certificates FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON public.certificates;
CREATE POLICY "Allow public delete access" ON public.certificates FOR DELETE USING (true);
`;

/**
 * Get stored Supabase configuration from localStorage or .env
 */
export function getStoredSupabaseConfig() {
  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return {
    url: (localUrl || envUrl || '').trim(),
    anonKey: (localKey || envKey || '').trim(),
    source: localUrl ? 'browser' : envUrl ? 'env' : 'none'
  };
}

/**
 * Save Supabase configuration to localStorage
 */
export function saveStoredSupabaseConfig(url, anonKey) {
  const trimmedUrl = (url || '').trim();
  const trimmedKey = (anonKey || '').trim();

  localStorage.setItem(STORAGE_KEY_URL, trimmedUrl);
  localStorage.setItem(STORAGE_KEY_KEY, trimmedKey);

  // Invalidate cached client
  cachedClient = null;
  cachedClientUrl = null;
  cachedClientKey = null;
}

/**
 * Clear Supabase configuration
 */
export function clearStoredSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  cachedClient = null;
  cachedClientUrl = null;
  cachedClientKey = null;
}

/**
 * Check if Supabase credentials are configured
 */
export function isSupabaseConfigured() {
  const { url, anonKey } = getStoredSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http'));
}

/**
 * Get Supabase Client singleton
 */
export function getSupabaseClient() {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  if (cachedClient && cachedClientUrl === url && cachedClientKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    cachedClientUrl = url;
    cachedClientKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Convert frontend certificate object to Supabase database row
 */
export function toSupabaseRow(cert) {
  return {
    id: cert.id,
    student_name: cert.studentName || 'Verified Candidate',
    platform: cert.platform || 'Institutional Issuer',
    course_title: cert.courseTitle || 'Accredited Certification Program',
    total_duration: cert.totalDuration || 'Standard Duration',
    date_of_completion: cert.dateOfCompletion || cert.issueDate || new Date().toISOString().slice(0, 10),
    issue_date: cert.issueDate || cert.dateOfCompletion || new Date().toISOString().slice(0, 10),
    credential_id: cert.credentialId || '',
    verification_url: cert.verificationUrl || '',
    category: cert.category || 'Course',
    skills: Array.isArray(cert.skills) ? cert.skills : [],
    internship_details: cert.internshipDetails || null,
    qr_code_data: cert.qrCodeData || null,
    authenticity_status: cert.authenticityStatus || 'Verified Authentic',
    trust_score: cert.trustScore !== undefined && cert.trustScore !== null ? Number(cert.trustScore) : 95,
    forensic_summary: cert.forensicSummary || '',
    forensic_checklist: cert.forensicChecklist || null,
    file_data: cert.fileData || '',
    file_name: cert.fileName || 'certificate',
    file_type: cert.fileType || 'application/pdf',
    file_size: Number(cert.fileSize) || 0,
    uploaded_at: cert.uploadedAt || new Date().toISOString()
  };
}

/**
 * Convert Supabase database row to frontend certificate object
 */
export function fromSupabaseRow(row) {
  return {
    id: row.id,
    studentName: row.student_name || 'Verified Candidate',
    platform: row.platform || 'Institutional Issuer',
    courseTitle: row.course_title || 'Accredited Certification Program',
    totalDuration: row.total_duration || 'Standard Duration',
    dateOfCompletion: row.date_of_completion || row.issue_date || new Date().toISOString().slice(0, 10),
    issueDate: row.issue_date || row.date_of_completion || new Date().toISOString().slice(0, 10),
    credentialId: row.credential_id || '',
    verificationUrl: row.verification_url || '',
    category: row.category || 'Course',
    skills: Array.isArray(row.skills) ? row.skills : [],
    internshipDetails: row.internship_details || null,
    qrCodeData: row.qr_code_data || null,
    authenticityStatus: row.authenticity_status || 'Verified Authentic',
    trustScore: row.trust_score !== null && row.trust_score !== undefined ? Number(row.trust_score) : 95,
    forensicSummary: row.forensic_summary || '',
    forensicChecklist: row.forensic_checklist || null,
    fileData: row.file_data || '',
    fileName: row.file_name || 'certificate',
    fileType: row.file_type || 'application/pdf',
    fileSize: Number(row.file_size) || 0,
    uploadedAt: row.uploaded_at || row.created_at || new Date().toISOString()
  };
}

/**
 * Test Supabase Connection and check if certificates table exists
 */
export async function testSupabaseConnection(customUrl, customKey) {
  const url = (customUrl || '').trim();
  const key = (customKey || '').trim();

  if (!url || !key) {
    throw new Error('Please provide both Supabase Project URL and Anon Public Key.');
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('Project URL must start with https://');
  }

  let tempClient;
  try {
    tempClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  } catch (e) {
    throw new Error(`Failed to initialize client: ${e.message}`);
  }

  // Probe certificates table
  const { data, error, count } = await tempClient
    .from('certificates')
    .select('id', { count: 'exact', head: true });

  if (error) {
    // Check if table missing
    if (
      error.code === '42P01' || 
      error.message?.toLowerCase().includes('relation') ||
      error.message?.toLowerCase().includes('not found') ||
      error.code === 'PGRST204'
    ) {
      return {
        success: false,
        tableMissing: true,
        message: 'Connected to your Supabase project! However, the "certificates" table does not exist yet. Please run the provided SQL Schema script in your Supabase SQL Editor.'
      };
    }

    throw new Error(`Supabase query failed (${error.code || 'ERR'}): ${error.message}`);
  }

  return {
    success: true,
    tableMissing: false,
    count: count || 0,
    message: `Connected successfully to Supabase! Certificates table found.`
  };
}

/**
 * Fetch all certificates from Supabase
 */
export async function fetchCertificatesFromSupabase() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await client
    .from('certificates')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch from Supabase: ${error.message}`);
  }

  return (data || []).map(fromSupabaseRow);
}

/**
 * Insert or update a single certificate in Supabase
 */
export async function saveCertificateToSupabase(certificate) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not initialized');
  }

  const row = toSupabaseRow(certificate);
  const { data, error } = await client
    .from('certificates')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save to Supabase: ${error.message}`);
  }

  return fromSupabaseRow(data || row);
}

/**
 * Delete a certificate from Supabase by ID
 */
export async function deleteCertificateFromSupabase(id) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await client
    .from('certificates')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete from Supabase: ${error.message}`);
  }
}

/**
 * Batch sync local certificates to Supabase
 */
export async function syncLocalCertificatesToSupabase(certificates) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not initialized');
  }

  if (!certificates || certificates.length === 0) {
    return 0;
  }

  const rows = certificates.map(toSupabaseRow);
  const { error } = await client
    .from('certificates')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    throw new Error(`Batch sync failed: ${error.message}`);
  }

  return rows.length;
}
