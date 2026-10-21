import { INITIAL_SAMPLE_CERTIFICATES } from './sampleCertificates';
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
export async function getLocalCertificates() {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = async () => {
        const certs = request.result;
        if (!certs || certs.length === 0) {
          // Auto-seed initial realistic demo certificates
          await seedInitialCertificates();
          resolve(INITIAL_SAMPLE_CERTIFICATES);
        } else {
          // Auto-migrate legacy cached Aditya Sharma sample cert if present
          const sanitized = certs.map(c => {
            if (c.studentName === 'Aditya Sharma' || c.id === 'cert-coursera-deeplearning-01') {
              return {
                ...c,
                studentName: 'Sivaram Suresh',
                fileName: c.fileName?.replace('Aditya_Sharma', 'Sivaram_Suresh') || c.fileName
              };
            }
            return c;
          });
          // Sort newest uploaded first
          resolve(sanitized.sort((a, b) => new Date(b.uploadedAt || b.issueDate) - new Date(a.uploadedAt || a.issueDate)));
        }
      };
      request.onerror = () => {
        resolve(getFallbackLocalStorage());
      };
    });
  } catch (err) {
    console.warn('Falling back to localStorage storage:', err);
    return getFallbackLocalStorage();
  }
}

/**
 * Get all certificates (Primary: Supabase Cloud DB if configured; Secondary: Local IndexedDB)
 */
export async function getAllCertificates() {
  if (isSupabaseConfigured()) {
    try {
      const remoteCerts = await fetchCertificatesFromSupabase();
      
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
      
      // If Supabase table is brand new and empty, return empty array so user can deposit their first certificate
      return remoteCerts || [];
    } catch (err) {
      console.warn('Failed to load certificates from Supabase, falling back to local vault:', err.message);
      return getLocalCertificates();
    }
  }

  return getLocalCertificates();
}

/**
 * Seed initial sample certificates to local storage
 */
async function seedInitialCertificates() {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    for (const cert of INITIAL_SAMPLE_CERTIFICATES) {
      store.put(cert);
    }
  } catch (e) {
    console.warn('Failed to seed IndexedDB:', e);
    saveFallbackLocalStorage(INITIAL_SAMPLE_CERTIFICATES);
  }
}

/**
 * Save or update a certificate (Writes to Supabase Cloud DB + Local IndexedDB)
 */
export async function saveCertificate(certificate) {
  const certToSave = {
    ...certificate,
    id: certificate.id || `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
 * Reset vault to default demo certificates
 */
export async function resetVaultToDemo() {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });
    await seedInitialCertificates();
  } catch (err) {
    saveFallbackLocalStorage(INITIAL_SAMPLE_CERTIFICATES);
  }

  // Sync demo certificates to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await syncLocalCertificatesToSupabase(INITIAL_SAMPLE_CERTIFICATES);
    } catch (err) {
      console.warn('Could not sync demo certs to Supabase:', err);
    }
  }

  return INITIAL_SAMPLE_CERTIFICATES;
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
function getFallbackLocalStorage() {
  try {
    const data = localStorage.getItem('certivault_certificates');
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.map(c => {
        if (c.studentName === 'Aditya Sharma' || c.id === 'cert-coursera-deeplearning-01') {
          return {
            ...c,
            studentName: 'Sivaram Suresh',
            fileName: c.fileName?.replace('Aditya_Sharma', 'Sivaram_Suresh') || c.fileName
          };
        }
        return c;
      });
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_SAMPLE_CERTIFICATES;
}

function saveFallbackLocalStorage(certs) {
  try {
    localStorage.setItem('certivault_certificates', JSON.stringify(certs));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}
