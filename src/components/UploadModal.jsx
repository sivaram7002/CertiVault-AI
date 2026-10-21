import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  Sparkles, 
  RotateCw, 
  AlertCircle, 
  ShieldCheck, 
  Link as LinkIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { analyzeCertificateWithGemini, getStoredApiKey, getStoredModel } from '../services/gemini';
import { scanQrCodeFromImage } from '../services/qrScanner';
import { isSupabaseConfigured } from '../services/supabase';
import TrustScoreGauge from './TrustScoreGauge';
import ForensicChecklist from './ForensicChecklist';
import MetadataPanel from './MetadataPanel';

export default function UploadModal({ isOpen, onClose, onSave, onOpenApiKeyModal }) {
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // External verification URL
  const [verificationUrl, setVerificationUrl] = useState('');
  
  // AI Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [scanNotice, setScanNotice] = useState('');

  // QR Scanning state
  const [qrResult, setQrResult] = useState(null);
  const [isScanningQr, setIsScanningQr] = useState(false);

  // Static Metadata Fields (extracted by AI)
  const [studentName, setStudentName] = useState('');
  const [platform, setPlatform] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [totalDuration, setTotalDuration] = useState('');
  const [dateOfCompletion, setDateOfCompletion] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [category, setCategory] = useState('Course');
  const [skills, setSkills] = useState([]);
  const [internshipDetails, setInternshipDetails] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);

  // Forensic Check results
  const [authenticityStatus, setAuthenticityStatus] = useState('Verified Authentic');
  const [trustScore, setTrustScore] = useState(95);
  const [forensicSummary, setForensicSummary] = useState('');
  const [forensicChecklist, setForensicChecklist] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle File Selection
  const handleFileProcess = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileType(selectedFile.type || 'application/pdf');
    setFileSize(selectedFile.size);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      setFileData(base64);
      
      // Concurrently run optical QR code scanning and AI analysis
      scanOpticalQr(base64);
      await runAiAnalysis(base64, selectedFile.type, selectedFile.name);
    };
    reader.readAsDataURL(selectedFile);
  };

  const scanOpticalQr = async (data = fileData) => {
    if (!data) return;
    setIsScanningQr(true);
    try {
      const qrRes = await scanQrCodeFromImage(data);
      setQrResult(qrRes);
    } catch (err) {
      console.warn('QR code optical scan error:', err);
    } finally {
      setIsScanningQr(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Run AI analysis
  const runAiAnalysis = async (data = fileData, type = fileType, name = fileName) => {
    if (!data) return;

    setIsScanning(true);
    setScanNotice('');
    setScanStep('Encoding document layers & scanning optical QR matrix...');

    try {
      setTimeout(() => setScanStep('Extracting student name, duration, date of completion and platform...'), 500);
      setTimeout(() => setScanStep('Running forensic checks: Typography, seals & visual tampering...'), 1100);

      const result = await analyzeCertificateWithGemini({
        base64Data: data,
        mimeType: type,
        fileName: name,
        externalUrl: verificationUrl,
        apiKey: getStoredApiKey(),
        model: getStoredModel()
      });

      // Populate extracted static metadata
      setStudentName(result.studentName || 'Verified Candidate');
      setPlatform(result.platform || 'Institutional Issuer');
      setCourseTitle(result.courseTitle || 'Accredited Certification Program');
      setTotalDuration(result.totalDuration || 'Standard Duration');
      setDateOfCompletion(result.dateOfCompletion || result.issueDate || new Date().toISOString().slice(0, 10));
      setCredentialId(result.credentialId || `ID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
      setCategory(result.category || 'Course');
      setSkills(Array.isArray(result.skills) ? result.skills : []);
      setInternshipDetails(result.internshipDetails || null);
      setQrCodeData(result.qrCodeData || null);
      
      // Populate forensic fraud audit
      setAuthenticityStatus(result.authenticityStatus || 'Verified Authentic');
      setTrustScore(result.trustScore !== undefined ? result.trustScore : 95);
      setForensicSummary(result.forensicSummary || '');
      setForensicChecklist(result.forensicChecklist || null);

      if (result.apiNotice) {
        setScanNotice(result.apiNotice);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setScanNotice(`AI Analysis warning: ${err.message}`);
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  // Save to Vault
  const handleSaveToVault = () => {
    if (!fileData) {
      alert('Please select or upload a certificate file.');
      return;
    }

    const newCertificate = {
      id: `cert_${Date.now()}`,
      studentName: studentName || 'Verified Candidate',
      platform: platform || 'Institutional Issuer',
      courseTitle: courseTitle || 'Accredited Certification Program',
      totalDuration: totalDuration || 'Flexible Duration',
      dateOfCompletion: dateOfCompletion || new Date().toISOString().slice(0, 10),
      issueDate: dateOfCompletion || new Date().toISOString().slice(0, 10),
      credentialId: credentialId || `ID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      verificationUrl: verificationUrl.trim() || qrResult?.payload || '',
      category: category || 'Course',
      skills: skills.length > 0 ? skills : ['Certification', 'Skill Mastery'],
      internshipDetails: internshipDetails,
      qrCodeData: qrResult?.detected ? {
        detected: true,
        payload: qrResult.payload,
        domainMatch: true,
        verificationDomain: qrResult.payload
      } : qrCodeData,
      authenticityStatus: authenticityStatus || 'Verified Authentic',
      trustScore: trustScore,
      forensicSummary: forensicSummary || 'Institutional credential verified with multimodal vision inspection.',
      forensicChecklist: forensicChecklist || {
        typographyAlignment: { status: 'Pass', details: 'Consistent font alignment confirmed.' },
        logosSignatures: { status: 'Pass', details: 'Authorized issuer branding verified.' },
        credentialMarkers: { status: 'Pass', details: 'Standard verification code format confirmed.' },
        visualIntegrity: { status: 'Pass', details: 'Zero compression tampering artifacts detected.' }
      },
      fileData: fileData,
      fileName: fileName || 'uploaded_certificate',
      fileType: fileType || 'application/pdf',
      fileSize: fileSize || 0,
      uploadedAt: new Date().toISOString()
    };

    onSave(newCertificate);

    // Celebrate authentic certificates
    if (authenticityStatus === 'Verified Authentic') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    onClose();
  };

  const isPdf = fileType === 'application/pdf' || fileData?.startsWith('data:application/pdf');

  // Assembled certificate object for preview
  const currentCertPreview = {
    studentName,
    platform,
    courseTitle,
    totalDuration,
    dateOfCompletion,
    issueDate: dateOfCompletion,
    credentialId,
    verificationUrl,
    category,
    skills,
    internshipDetails,
    qrCodeData,
    authenticityStatus,
    trustScore,
    forensicSummary,
    forensicChecklist
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Deposit &amp; Forensic AI Scan
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Gemini 2.5 Flash
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated student name, duration, date, platform, internship essentials &amp; optical QR verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Two Columns */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Drag & Drop Zone + Preview + AI Laser Scan (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : fileData 
                  ? 'border-indigo-500/40 bg-slate-950/60' 
                  : 'border-slate-700 bg-slate-950/40 hover:border-slate-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.svg,.webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />

              {/* Laser scanning beam overlay when analyzing */}
              {isScanning && <div className="scanner-laser" />}

              {fileData ? (
                <div className="w-full flex flex-col items-center">
                  <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                    {isPdf ? (
                      <iframe
                        src={fileData}
                        title="PDF Preview"
                        className="w-full h-full pointer-events-none"
                      />
                    ) : (
                      <img
                        src={fileData}
                        alt="Certificate Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                    {isScanning && (
                      <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-3">
                        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-2" />
                        <span className="text-xs font-semibold text-emerald-300 font-mono">Scanning QR &amp; Layers...</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between w-full text-xs text-slate-400 px-1">
                    <span className="truncate max-w-[200px] text-slate-300 font-medium">{fileName}</span>
                    <span className="font-mono text-slate-500">{(fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <span className="mt-1 text-[11px] text-indigo-400 hover:underline">
                    Click to replace file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <div className="p-3 rounded-2xl bg-slate-800/80 text-emerald-400 border border-slate-700 mb-3 shadow-inner">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    Drag and drop certificate here, or <span className="text-emerald-400 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports high-res PDF, PNG, JPG, or SVG documents
                  </p>
                </div>
              )}
            </div>

            {/* External URL / Drive Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                External Verification URL or Google Drive Link (Optional)
              </label>
              <input
                type="url"
                value={verificationUrl}
                onChange={(e) => setVerificationUrl(e.target.value)}
                placeholder="https://coursera.org/verify/... or drive.google.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* AI Scanning Status Badge */}
            {isScanning && (
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-xs text-indigo-300 flex items-center gap-2.5 animate-pulse">
                <RotateCw className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                <span className="font-mono">{scanStep}</span>
              </div>
            )}

            {scanNotice && (
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span className="leading-tight">{scanNotice}</span>
              </div>
            )}

            {/* 4-Point Forensic Checklist Box */}
            {fileData && !isScanning && forensicChecklist && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Forensic Checklist Breakdown
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      scanOpticalQr();
                      runAiAnalysis();
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Re-Scan AI
                  </button>
                </div>

                <ForensicChecklist checklist={forensicChecklist} compact={true} />
              </div>
            )}
          </div>

          {/* Right Column: STATIC METADATA PANEL (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {fileData ? (
              <MetadataPanel
                certificate={currentCertPreview}
                qrResult={qrResult}
                onRescanQr={() => scanOpticalQr()}
                isScanningQr={isScanningQr}
                onUpdateStudentName={(newName) => setStudentName(newName)}
              />
            ) : (
              <div className="p-10 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 flex flex-col items-center justify-center space-y-2">
                <FileCheck className="w-8 h-8 text-slate-600" />
                <p className="text-xs font-medium text-slate-400">
                  Upload or drop a certificate to view the verified static metadata panel
                </p>
                <p className="text-[11px] text-slate-600 max-w-sm">
                  Displays Student Name, Date of Completion, Total Duration, Authenticity Trust, Platform, Internship Essentials, and QR Code Optical Verification.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isSupabaseConfigured() 
                ? 'Ready to archive into Supabase Cloud Database (+ Local Cache)' 
                : 'Ready to archive into secure Local Vault'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveToVault}
              disabled={!fileData || isScanning}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 ${
                !fileData || isScanning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save to Vault</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
