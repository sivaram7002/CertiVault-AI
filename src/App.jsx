import React, { useState, useEffect, useMemo } from 'react';
import { 
  getAllCertificates, 
  saveCertificate, 
  deleteCertificate, 
  resetVaultToDemo, 
  exportVaultJson, 
  importVaultJson 
} from './services/storage';
import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';
import FilterBar from './components/FilterBar';
import CertificateCard from './components/CertificateCard';
import CertificateTable from './components/CertificateTable';
import UploadModal from './components/UploadModal';
import InspectionModal from './components/InspectionModal';
import ApiKeyModal from './components/ApiKeyModal';
import { 
  ShieldCheck, 
  UploadCloud, 
  FileCheck, 
  AlertTriangle, 
  Sparkles, 
  RotateCcw,
  Plus,
  Eye,
  Award
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
  const [inspectedCert, setInspectedCert] = useState(null);

  // Load certificates on mount
  useEffect(() => {
    async function loadVault() {
      try {
        const certs = await getAllCertificates();
        setCertificates(certs);
      } catch (err) {
        console.error('Failed to load certificates from IndexedDB:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVault();
  }, []);

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
    const saved = await saveCertificate(newCert);
    setCertificates(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
  };

  const handleUpdateCertificate = async (updatedCert) => {
    const saved = await saveCertificate(updatedCert);
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

  const handleResetDemo = async () => {
    setLoading(true);
    const demoCerts = await resetVaultToDemo();
    setCertificates(demoCerts);
    setLoading(false);
  };

  const handleImportJson = async (json) => {
    try {
      const imported = await importVaultJson(json);
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
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onExport={exportVaultJson}
        onImport={handleImportJson}
      />

      {/* Hero / Quick Banner */}
      <div className="relative border-b border-slate-900 bg-gradient-to-b from-slate-900/60 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Forensic Document Vision Active</span>
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
                onClick={() => setIsUploadOpen(true)}
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
            <span className="text-xs font-mono">Accessing IndexedDB Vault Storage...</span>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800/80 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-500 border border-slate-800">
              <FileCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200">No certificates match your query</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try modifying your search keywords or deposit a new course or internship certificate.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {certificates.length === 0 ? (
                <button
                  onClick={handleResetDemo}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Load Demo Certificates
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
            <span>Zero-Cloud Local Storage (IndexedDB)</span>
            <span>•</span>
            <button
              onClick={handleResetDemo}
              className="text-indigo-400 hover:underline"
            >
              Reset Demo Samples
            </button>
          </div>
        </div>
      </footer>

      {/* Upload & AI Scan Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSave={handleSaveCertificate}
        onOpenApiKeyModal={() => setIsApiKeyOpen(true)}
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
        onResetDemo={handleResetDemo}
      />
    </div>
  );
}
