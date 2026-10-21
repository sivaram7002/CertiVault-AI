import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getAllCertificates, 
  saveCertificate, 
  deleteCertificate, 
  exportVaultJson, 
  importVaultJson 
} from './services/storage';
import { isSupabaseConfigured, subscribeToRealtimeCertificates } from './services/supabase';
import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';
import FilterBar from './components/FilterBar';
import CertificateCard from './components/CertificateCard';
import CertificateTable from './components/CertificateTable';
import UploadModal from './components/UploadModal';
import InspectionModal from './components/InspectionModal';
import ApiKeyModal from './components/ApiKeyModal';
import SupabaseModal from './components/SupabaseModal';
import ProfileModal from './components/ProfileModal';
import { getCurrentProfile, subscribeToAuthEvents } from './services/auth';
import { 
  ShieldCheck, 
  UploadCloud, 
  FileCheck, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  Eye, 
  Award, 
  Database, 
  Lock, 
  Mail,
  Zap,
  X
} from 'lucide-react';

export default function App() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newestUpload');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [inspectedCert, setInspectedCert] = useState(null);

  // Authenticated User Profile
  const [userProfile, setUserProfile] = useState(null);

  // Supabase Realtime Reaction States
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [realtimeToast, setRealtimeToast] = useState(null);

  const hasCloudDb = isSupabaseConfigured();

  // Load user profile on startup and listen for OAuth changes
  useEffect(() => {
    getCurrentProfile().then(p => {
      if (p) {
        setUserProfile(p);
      } else {
        setLoading(false);
      }
    });

    const unsubscribe = subscribeToAuthEvents((p) => {
      setUserProfile(p);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Load certificates strictly for authenticated user
  const loadVault = useCallback(async (overrideEmail, overridePhone) => {
    const activeEmail = overrideEmail !== undefined ? overrideEmail : userProfile?.email;
    const activePhone = overridePhone !== undefined ? overridePhone : userProfile?.phone;
    if (!activeEmail && !activePhone) {
      setCertificates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const certs = await getAllCertificates(activeEmail, activePhone);
      setCertificates(certs);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.email, userProfile?.phone]);

  useEffect(() => {
    if (userProfile?.email || userProfile?.phone) {
      loadVault(userProfile.email, userProfile.phone);
    } else {
      setCertificates([]);
      setLoading(false);
    }
  }, [userProfile, loadVault]);

  // Supabase Realtime Reaction Listener
  useEffect(() => {
    if (!hasCloudDb) return;

    const unsubscribe = subscribeToRealtimeCertificates(
      (reaction) => {
        // Trigger live refresh of certificates for active user
        loadVault();

        const title = reaction.certificate?.courseTitle || reaction.certificate?.studentName || 'Document';
        const action = reaction.action || 'SYNCHRONIZED';
        const actionLabel = action === 'DELETE' ? 'removed from' : action === 'UPDATE' ? 'updated in' : 'uploaded to';

        setRealtimeToast({
          id: Date.now(),
          action,
          title,
          message: `Realtime reaction: "${title}" was ${actionLabel} Supabase Cloud Database.`
        });

        // Auto-dismiss toast after 4.5 seconds
        setTimeout(() => {
          setRealtimeToast((current) => (current?.action === action ? null : current));
        }, 4500);
      },
      (isSubscribed) => {
        setRealtimeConnected(isSubscribed);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [hasCloudDb, loadVault]);

  // Filter & Sort computations
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      // 1. Authenticity Status Filter
      if (selectedStatus !== 'All' && cert.authenticityStatus !== selectedStatus) {
        return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (cert.courseTitle || '').toLowerCase().includes(q);
        const nameMatch = (cert.studentName || '').toLowerCase().includes(q);
        const platformMatch = (cert.platform || '').toLowerCase().includes(q);
        const credMatch = (cert.credentialId || '').toLowerCase().includes(q);
        const skillsMatch = (cert.skills || []).some(s => s.toLowerCase().includes(q));

        if (!titleMatch && !nameMatch && !platformMatch && !credMatch && !skillsMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'nameAsc':
          return (a.studentName || '').localeCompare(b.studentName || '');
        case 'newestIssue':
          return new Date(b.dateOfCompletion || b.issueDate || 0) - new Date(a.dateOfCompletion || a.issueDate || 0);
        case 'highestScore':
          return (b.trustScore || 0) - (a.trustScore || 0);
        case 'lowestScore':
          return (a.trustScore || 0) - (b.trustScore || 0);
        case 'titleAsc':
          return (a.courseTitle || '').localeCompare(b.courseTitle || '');
        case 'newestUpload':
        default:
          return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
      }
    });
  }, [certificates, searchQuery, selectedStatus, sortBy]);

  // Handlers
  const handleSaveCertificate = async (newCert) => {
    const saved = await saveCertificate(newCert, userProfile?.email, userProfile?.phone);
    setCertificates(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
  };

  const handleUpdateCertificate = async (updatedCert) => {
    const saved = await saveCertificate(updatedCert, userProfile?.email, userProfile?.phone);
    setCertificates(prev => prev.map(c => c.id === saved.id ? saved : c));
    setInspectedCert(saved);
  };

  const handleDeleteCertificate = async (id) => {
    await deleteCertificate(id);
    setCertificates(prev => prev.filter(c => c.id !== id));
    if (inspectedCert && inspectedCert.id === id) {
      setInspectedCert(null);
    }
  };

  const handleImportJson = async (json) => {
    try {
      const imported = await importVaultJson(json, userProfile?.email, userProfile?.phone);
      setCertificates(imported);
      alert(`Successfully imported ${json.length} certificates into CertiVault!`);
    } catch (e) {
      alert('Import failed: ' + e.message);
    }
  };

  const handleDownloadCertificate = (cert) => {
    if (!cert.fileData) return;
    const a = document.createElement('a');
    a.href = cert.fileData;
    a.download = cert.fileName || `${cert.courseTitle.replace(/\s+/g, '_')}_Certificate`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <Navbar
        user={userProfile}
        realtimeConnected={realtimeConnected}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenUpload={() => {
          if (!userProfile) {
            setIsProfileOpen(true);
          } else {
            setIsUploadOpen(true);
          }
        }}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onOpenSupabase={() => setIsSupabaseOpen(true)}
        onExport={() => exportVaultJson(userProfile?.email, userProfile?.phone)}
        onImport={handleImportJson}
      />

      {/* Hero / Quick Banner */}
      <div className="relative border-b border-slate-900 bg-gradient-to-b from-slate-900/60 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Forensic Document Vision Active</span>
                </div>

                <button
                  onClick={() => setIsSupabaseOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                    hasCloudDb 
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' 
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Database className={`w-3.5 h-3.5 ${hasCloudDb ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{hasCloudDb ? 'Supabase Database Connected' : 'Storage: Local Vault (Click to connect Supabase)'}</span>
                </button>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Academic &amp; Professional Credential Repository
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Store, organize, and audit verified certifications. Multimodal AI inspects typography, baseline alignment, issuer stamps, and raster pixel halos to protect against credential tampering.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if (!userProfile) {
                    setIsProfileOpen(true);
                  } else {
                    setIsUploadOpen(true);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload &amp; Scan File</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {!userProfile ? (
          <div className="glass-panel rounded-3xl p-8 sm:p-14 text-center border border-indigo-500/30 max-w-2xl mx-auto space-y-6 shadow-2xl relative overflow-hidden my-6">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
              <Lock className="w-8 h-8 text-indigo-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Private Credential Vault
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Uploaded Documents are Confidential &amp; Inaccessible
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                All certificates, PDFs, and forensic audit records are strictly confidential. Only the authorized owner can view or access them. Please log in with your Phone Number or Gmail &amp; Password with OTP confirmation to unlock your vault.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition flex items-center justify-center gap-2.5"
              >
                <Lock className="w-4 h-4" />
                <span>Login with Phone / Gmail &amp; OTP</span>
              </button>

              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Deposit Document (Login Required)</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-6 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Owner Isolation</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-indigo-400" /> Private Cloud Storage</span>
              <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-sky-400" /> Zero Public Access</span>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Dashboard Summary Stats Bar */}
            <StatsBar certificates={certificates} />

            {/* 2. Filter, Search & View Controls */}
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {/* 3. Certificate Grid or Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
                <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono">
                  {hasCloudDb ? 'Connecting to Supabase Cloud Database...' : 'Accessing Local Vault Storage...'}
                </span>
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800/80 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-500 border border-slate-800">
                  <FileCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-200">No private certificates match your query</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Try modifying your search keywords or deposit a new course or internship certificate to your private vault.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  {certificates.length === 0 ? (
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                      <Plus className="w-4 h-4" /> Deposit Certificate
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedStatus('All');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    >
                      Clear Search Filters
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCertificates.map((cert) => (
                  <CertificateCard
                    key={cert.id}
                    certificate={cert}
                    onInspect={(c) => setInspectedCert(c)}
                    onDelete={handleDeleteCertificate}
                    onDownload={handleDownloadCertificate}
                  />
                ))}
              </div>
            ) : (
              <CertificateTable
                certificates={filteredCertificates}
                onInspect={(c) => setInspectedCert(c)}
                onDelete={handleDeleteCertificate}
                onDownload={handleDownloadCertificate}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">CertiVault AI</span>
            <span>—</span>
            <span>Multimodal Academic &amp; Internship Credential Vault</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Powered by Gemini 2.5 Flash Vision</span>
            <span>•</span>
            <span>Supabase Cloud Database &amp; Local Vault</span>
          </div>
        </div>
      </footer>

      {/* Upload & AI Scan Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSave={handleSaveCertificate}
        onOpenApiKeyModal={() => setIsApiKeyOpen(true)}
        onOpenProfileModal={() => setIsProfileOpen(true)}
        user={userProfile}
      />

      {/* Split-Screen Document & Forensic Inspection Modal */}
      <InspectionModal
        certificate={inspectedCert}
        isOpen={Boolean(inspectedCert)}
        onClose={() => setInspectedCert(null)}
        onUpdate={handleUpdateCertificate}
        onDelete={handleDeleteCertificate}
        onDownload={handleDownloadCertificate}
      />

      {/* Gemini API Key & Model Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
      />

      {/* Supabase Cloud Database Configuration Modal */}
      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
        onConfigUpdated={loadVault}
      />

      {/* User Profile & Gmail Credentials Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={userProfile}
        onUserChange={setUserProfile}
        certificates={certificates}
      />

      {/* Floating Supabase Realtime Reaction Toast */}
      {realtimeToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="glass-panel px-4 py-3 rounded-2xl border border-emerald-500/40 bg-slate-900/95 shadow-2xl shadow-emerald-500/10 flex items-center gap-3 text-xs max-w-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-slate-100">
                <span>Supabase Realtime Reaction</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-300 truncate mt-0.5 font-medium">
                {realtimeToast.message}
              </p>
            </div>
            <button
              onClick={() => setRealtimeToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
