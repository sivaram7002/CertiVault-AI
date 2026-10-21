import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  RotateCw, 
  Trash2, 
  Code2, 
  Award, 
  Lock,
  FileBadge
} from 'lucide-react';
import DocumentViewer from './DocumentViewer';
import ForensicChecklist from './ForensicChecklist';
import MetadataPanel from './MetadataPanel';
import { scanQrCodeFromImage } from '../services/qrScanner';
import { analyzeCertificateWithGemini, getStoredApiKey, getStoredModel } from '../services/gemini';

export default function InspectionModal({ certificate, isOpen, onClose, onUpdate, onDelete, onDownload }) {
  if (!isOpen || !certificate) return null;

  const [activeTab, setActiveTab] = useState('forensics'); // 'forensics' | 'json'
  const [isRescanning, setIsRescanning] = useState(false);
  const [rescanNotice, setRescanNotice] = useState('');
  
  // Client-side QR scan result
  const [qrResult, setQrResult] = useState(null);
  const [isScanningQr, setIsScanningQr] = useState(false);

  // Scan QR code when modal opens or certificate changes
  useEffect(() => {
    if (certificate?.fileData) {
      runQrScan(certificate.fileData);
    }
  }, [certificate?.fileData]);

  const runQrScan = async (fileData) => {
    if (!fileData) return;
    setIsScanningQr(true);
    try {
      const res = await scanQrCodeFromImage(fileData);
      setQrResult(res);
    } catch (err) {
      console.warn('QR scan error:', err);
    } finally {
      setIsScanningQr(false);
    }
  };

  const {
    courseTitle,
    studentName,
    platform,
    category,
    forensicChecklist
  } = certificate;

  const handleRescan = async () => {
    setIsRescanning(true);
    setRescanNotice('Re-analyzing document visual layers with Gemini 2.5 Flash...');
    try {
      // Re-scan QR code
      await runQrScan(certificate.fileData);

      // Re-scan with Gemini Vision
      const result = await analyzeCertificateWithGemini({
        base64Data: certificate.fileData,
        mimeType: certificate.fileType,
        fileName: certificate.fileName,
        externalUrl: certificate.verificationUrl,
        apiKey: getStoredApiKey(),
        model: getStoredModel()
      });

      const updated = {
        ...certificate,
        ...result,
        skills: result.skills || certificate.skills,
        updatedAt: new Date().toISOString()
      };

      onUpdate(updated);
      setRescanNotice('AI Re-scan complete and static record updated.');
    } catch (err) {
      setRescanNotice(`Re-scan failed: ${err.message}`);
    } finally {
      setIsRescanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[94vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 truncate" title={courseTitle}>
                  {courseTitle || 'Certificate Inspection'}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  <Lock className="w-2.5 h-2.5 text-indigo-400" />
                  Private Credential (Confidential)
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Name on Certificate: <strong className="text-emerald-300 font-bold">{studentName}</strong></span>
                <span>•</span>
                <span>Platform: <strong className="text-slate-200">{platform}</strong></span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tab switchers */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('forensics')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'forensics' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Forensic Report
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'json' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw JSON
              </button>
            </div>

            <button
              onClick={() => onDownload(certificate)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
              title="Download Document"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 border border-slate-700 transition"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Split-Screen View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Column: Embedded Document Viewer (7 Cols) */}
          <div className="lg:col-span-7 h-full p-4 overflow-hidden flex flex-col bg-slate-950/40 border-r border-slate-800">
            <DocumentViewer
              fileData={certificate.fileData}
              fileName={certificate.fileName}
              fileType={certificate.fileType}
              externalUrl={certificate.verificationUrl}
            />
          </div>

          {/* Right Column: STATIC AI Forensic Report & Metadata Panel (5 Cols) */}
          <div className="lg:col-span-5 h-full overflow-y-auto p-5 space-y-5 bg-slate-900/60">
            {activeTab === 'forensics' && (
              <>
                {/* Unified Static Metadata Panel */}
                <MetadataPanel
                  certificate={certificate}
                  qrResult={qrResult}
                  onRescanQr={() => runQrScan(certificate.fileData)}
                  isScanningQr={isScanningQr}
                />

                {/* 4-Point Forensic Checklist */}
                {forensicChecklist && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <ForensicChecklist checklist={forensicChecklist} />
                  </div>
                )}

                {/* Re-Scan Action Banner */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block">Multimodal AI Inspection</span>
                    <span className="text-[11px] text-slate-500">Re-verify document layers &amp; credentials</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRescan}
                    disabled={isRescanning}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-indigo-500/30"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isRescanning ? 'animate-spin' : ''}`} />
                    <span>{isRescanning ? 'Re-scanning...' : 'Re-Scan AI'}</span>
                  </button>
                </div>

                {rescanNotice && (
                  <div className="text-[11px] text-indigo-300 font-mono bg-indigo-950/30 p-2 rounded border border-indigo-900/50">
                    {rescanNotice}
                  </div>
                )}
              </>
            )}

            {/* TAB 2: Raw AI JSON */}
            {activeTab === 'json' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    Multimodal Vision Output Schema
                  </span>
                </div>

                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[480px]">
                  {JSON.stringify(certificate, null, 2)}
                </pre>
              </div>
            )}

            {/* Danger Zone: Delete Certificate */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500">Vault Item Management</span>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${courseTitle}" from the vault?`)) {
                    onDelete(certificate.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600/15 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Certificate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
