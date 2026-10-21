import { 
  isSupabaseConfigured, 
  fetchCertificatesFromSupabase, 
  saveCertificateToSupabase, 
  deleteCertificateFromSupabase,
  syncLocalCertificatesToSupabase 
} from './supabase';

const DB_NAME = 'certivault_ai_db';
const DB_VERSION = 1;
const STORE_NAME = 'certificates';

const DEMO_CERT_IDS = new Set([
  'cert-coursera-deeplearning-01',
  'cert-nptel-cloud-02',
  'cert-msft-internship-03',
  'cert-tampered-meta-04'
]);

/**
 * Open or initialize the IndexedDB database
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('platform', 'platform', { unique: false });
        store.createIndex('authenticityStatus', 'authenticityStatus', { unique: false });
        store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get current storage mode: 'supabase' (Cloud DB) or 'indexeddb' (Local Vault)
 */
export function getStorageMode() {
  return isSupabaseConfigured() ? 'supabase' : 'indexeddb';
}

/**
 * Get all certificates from local IndexedDB (or fallback to LocalStorage)
 */
export async function getLocalCertificates(userEmail) {
  if (!userEmail) return [];

  const normalizedEmail = userEmail.toLowerCase().trim();
  const emailPrefix = normalizedEmail.split('@')[0];

  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const certs = request.result || [];
        
        // Purge residual demo certificates if present in client's local store
        const sanitized = certs.filter(c => !DEMO_CERT_IDS.has(c.id));
        for (const c of certs) {
          if (DEMO_CERT_IDS.has(c.id)) {
            try { store.delete(c.id); } catch (e) {}
          }
        }
        
        // Strictly filter to authenticated owner's certificates
        const userCerts = sanitized.filter(c => {
          const owner = (c.ownerEmail || '').toLowerCase().trim();
          if (owner === normalizedEmail) return true;
          const fileName = (c.fileName || '').toLowerCase();
          const studentName = (c.studentName || '').toLowerCase();
          return fileName.includes(emailPrefix) || studentName.includes(emailPrefix);
        });

        // Sort newest uploaded first
        resolve(userCerts.sort((a, b) => new Date(b.uploadedAt || b.issueDate) - new Date(a.uploadedAt || a.issueDate)));
      };
      request.onerror = () => {
        resolve(getFallbackLocalStorage(userEmail));
      };
    });
  } catch (err) {
    console.warn('Falling back to localStorage storage:', err);
    return getFallbackLocalStorage(userEmail);
  }
}

/**
 * Get all certificates (Primary: Supabase Cloud DB if configured; Secondary: Local IndexedDB)
 * Privacy Rule: If user is not authenticated, returns empty list (Private Vault Locked)
 */
export async function getAllCertificates(userEmail) {
  if (!userEmail) {
    // Unauthenticated visitors have ZERO access to uploaded documents
    return [];
  }

  const normalizedEmail = userEmail.toLowerCase().trim();

  if (isSupabaseConfigured()) {
    try {
      const rawCerts = await fetchCertificatesFromSupabase(normalizedEmail);
      const remoteCerts = (rawCerts || []).filter(c => !DEMO_CERT_IDS.has(c.id));
      
      // Cache remote certificates to local IndexedDB for instant offline availability
      if (Array.isArray(remoteCerts) && remoteCerts.length > 0) {
        try {
          const db = await openDB();
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          for (const cert of remoteCerts) {
            store.put(cert);
          }
        } catch (e) {
          console.warn('Failed to cache remote certificates locally:', e);
        }
        return remoteCerts;
      }
      
      return remoteCerts || [];
    } catch (err) {
      console.warn('Failed to load certificates from Supabase, falling back to local vault:', err.message);
      return getLocalCertificates(normalizedEmail);
    }
  }

  return getLocalCertificates(normalizedEmail);
}

/**
 * Save or update a certificate (Writes to Supabase Cloud DB + Local IndexedDB)
 */
export async function saveCertificate(certificate, userEmail) {
  const assignedOwner = (userEmail || certificate.ownerEmail || '').toLowerCase().trim();
  const certToSave = {
    ...certificate,
    id: certificate.id || `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    isPrivate: true,
    ownerEmail: assignedOwner,
    uploadedAt: certificate.uploadedAt || new Date().toISOString(),
  };

  // 1. Save to local IndexedDB (always keep local cache immediate)
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const request = store.put(certToSave);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed saving to IndexedDB, saving to localStorage:', err);
    const existing = getFallbackLocalStorage();
    const index = existing.findIndex(c => c.id === certToSave.id);
    if (index >= 0) {
      existing[index] = certToSave;
    } else {
      existing.unshift(certToSave);
    }
    saveFallbackLocalStorage(existing);
  }

  // 2. Save to Supabase Cloud Database if configured
  if (isSupabaseConfigured()) {
    try {
      const savedRemote = await saveCertificateToSupabase(certToSave);
      return savedRemote || certToSave;
    } catch (err) {
      console.error('Supabase cloud database save error:', err);
      // Still return certToSave because local save succeeded
      certToSave._cloudSyncWarning = err.message;
      return certToSave;
    }
  }

  return certToSave;
}

/**
 * Delete a certificate by ID (Deletes from Supabase + Local Storage)
 */
export async function deleteCertificate(id) {
  // 1. Delete from local storage
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed deleting from IndexedDB, using fallback:', err);
    const existing = getFallbackLocalStorage();
    const filtered = existing.filter(c => c.id !== id);
    saveFallbackLocalStorage(filtered);
  }

  // 2. Delete from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await deleteCertificateFromSupabase(id);
    } catch (err) {
      console.error('Supabase delete error:', err);
    }
  }
}

/**
 * Clear all certificates from vault
 */
export async function clearVault() {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  } catch (err) {
    saveFallbackLocalStorage([]);
  }

  return [];
}

/**
 * Export vault data as JSON backup
 */
export async function exportVaultJson() {
  const certs = await getAllCertificates();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(certs, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `CertiVault_AI_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Import vault certificates from JSON
 */
export async function importVaultJson(jsonData) {
  if (!Array.isArray(jsonData)) {
    throw new Error('Invalid vault file format: expected an array of certificates');
  }
  for (const cert of jsonData) {
    await saveCertificate(cert);
  }
  return await getAllCertificates();
}

// Fallback LocalStorage Helpers
function getFallbackLocalStorage(userEmail) {
  if (!userEmail) return [];
  const normalizedEmail = userEmail.toLowerCase().trim();
  const emailPrefix = normalizedEmail.split('@')[0];

  try {
    const data = localStorage.getItem('certivault_certificates');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(c => !DEMO_CERT_IDS.has(c.id))
          .filter(c => {
            const owner = (c.ownerEmail || '').toLowerCase().trim();
            if (owner === normalizedEmail) return true;
            const fileName = (c.fileName || '').toLowerCase();
            const studentName = (c.studentName || '').toLowerCase();
            return fileName.includes(emailPrefix) || studentName.includes(emailPrefix);
          });
      }
    }
  } catch (e) {
    // ignore
  }
  return [];
}

function saveFallbackLocalStorage(certs) {
  try {
    localStorage.setItem('certivault_certificates', JSON.stringify(certs));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}
