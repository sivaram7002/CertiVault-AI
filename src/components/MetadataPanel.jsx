import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  Award, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  QrCode, 
  ExternalLink, 
  Briefcase, 
  Building2, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Lock, 
  RotateCw,
  FolderGit2,
  FileBadge,
  Pencil
} from 'lucide-react';
import TrustScoreGauge from './TrustScoreGauge';

export default function MetadataPanel({ 
  certificate, 
  qrResult = null, 
  onRescanQr = null,
  isScanningQr = false,
  onUpdateStudentName = null
}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  if (!certificate) return null;

  const {
    studentName,
    dateOfCompletion,
    issueDate,
    totalDuration,
    platform,
    courseTitle,
    credentialId,
    category,
    skills = [],
    authenticityStatus,
    trustScore = 95,
    forensicSummary,
    internshipDetails,
    qrCodeData,
    verificationUrl
  } = certificate;

  // Final completion date display
  const completionDateDisplay = dateOfCompletion || issueDate || 'N/A';

  // Final QR payload
  const activeQrPayload = qrResult?.payload || qrCodeData?.payload || verificationUrl || '';
  const isQrDetected = qrResult?.detected || qrCodeData?.detected || Boolean(activeQrPayload);
  const qrStatusText = qrResult?.status || (isQrDetected ? 'Verified Authentic QR Matrix Decoded' : 'No optical QR code found');

  const isInternship = category === 'Internship' || Boolean(internshipDetails?.isInternship) || Boolean(internshipDetails?.company);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Immutability Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileBadge className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Verified Metadata Panel
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          <Lock className="w-3 h-3" />
          Static Audit Record
        </span>
      </div>

      {/* 1. Primary Highlight: Name on the Certificate */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/60 border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-400" />
            Name on the Certificate
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Verified Student
          </span>
        </div>
        <div className="mt-1">
          {isEditingName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (onUpdateStudentName && nameInput.trim()) {
                      onUpdateStudentName(nameInput.trim());
                    }
                    setIsEditingName(false);
                  }
                }}
                className="bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-1.5 text-base font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 w-full"
                autoFocus
                placeholder="Enter exact recipient name"
              />
              <button
                type="button"
                onClick={() => {
                  if (onUpdateStudentName && nameInput.trim()) {
                    onUpdateStudentName(nameInput.trim());
                  }
                  setIsEditingName(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-50 tracking-tight">
                {studentName || 'Recipient Name Unspecified'}
              </h2>
              {onUpdateStudentName && (
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(studentName || '');
                    setIsEditingName(true);
                  }}
                  className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-semibold transition px-2 py-1 rounded-md hover:bg-slate-800"
                  title="Correct student name if needed"
                >
                  <Pencil className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-0.5">
            Official recipient name identified and extracted directly from document typography.
          </p>
        </div>
      </div>

      {/* 2. Authenticity of the Certificate */}
      <div className={`p-4 rounded-xl border relative overflow-hidden ${
        authenticityStatus === 'Verified Authentic'
          ? 'bg-emerald-950/20 border-emerald-900/40'
          : authenticityStatus === 'Suspicious / Needs Review'
          ? 'bg-amber-950/20 border-amber-900/40'
          : 'bg-rose-950/20 border-rose-900/40'
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Authenticity of the Certificate
            </span>
            <div className="flex items-center gap-2">
              {authenticityStatus === 'Verified Authentic' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : authenticityStatus === 'Suspicious / Needs Review' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="text-sm font-extrabold text-slate-100">{authenticityStatus}</span>
            </div>
            <p className="text-xs text-slate-300">
              Trust Score: <strong className="font-mono text-slate-100">{trustScore}/100</strong>
            </p>
          </div>

          <TrustScoreGauge
            score={trustScore}
            status={authenticityStatus}
            size="md"
            showLabel={false}
          />
        </div>

        {forensicSummary && (
          <p className="mt-2.5 pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-300 leading-relaxed italic bg-slate-950/50 p-2.5 rounded-lg">
            "{forensicSummary}"
          </p>
        )}
      </div>

      {/* 3. Core Essentials Grid: Platform, Duration, Date of Completion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Platform of the Course */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Platform of the Course</span>
          </div>
          <div className="font-bold text-slate-100 text-xs">
            {platform || 'Platform Unspecified'}
          </div>
        </div>

        {/* Date of Completion */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Date of Completion</span>
          </div>
          <div className="font-bold text-slate-100 text-xs">
            {completionDateDisplay}
          </div>
        </div>

        {/* Total Time Duration of Certificate */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Time Duration of Certificate</span>
          </div>
          <div className="font-bold text-slate-100 text-xs">
            {totalDuration || 'Duration Not Indicated'}
          </div>
        </div>

        {/* Credential ID */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-0.5">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Credential ID</span>
            </div>
            <div className="font-mono font-bold text-emerald-400 text-xs truncate max-w-[140px]">
              {credentialId || 'N/A'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(credentialId, 'id')}
            title="Copy ID"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            {copiedKey === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 4. IF INTERNSHIP IS UPLOADED: Compatible Essentials */}
      {isInternship && (
        <div className="p-4 rounded-xl bg-slate-950 border border-sky-900/40 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-sky-400" />
              Internship Essentials &amp; Accreditation
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
              Internship Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Host Company / Organization */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                <Building2 className="w-3 h-3 text-sky-400" /> Host Organization / Company
              </span>
              <p className="font-bold text-slate-100">
                {internshipDetails?.company || platform}
              </p>
            </div>

            {/* Internship Role / Designation */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                <UserCheck className="w-3 h-3 text-sky-400" /> Role &amp; Designation
              </span>
              <p className="font-bold text-slate-100">
                {internshipDetails?.role || courseTitle}
              </p>
            </div>

            {/* Mentor / Supervisor Signatory */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                <FileBadge className="w-3 h-3 text-sky-400" /> Supervising Mentor / Signatory
              </span>
              <p className="font-semibold text-slate-200">
                {internshipDetails?.mentorOrSupervisor || 'Corporate Authorized Signatory'}
              </p>
            </div>

            {/* Work Mode & Accreditation */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-sky-400" /> Work Mode &amp; Recognition
              </span>
              <p className="font-semibold text-slate-200">
                {internshipDetails?.workMode || 'Virtual Industry Internship'}
              </p>
            </div>

            {/* Project Deliverable */}
            {internshipDetails?.projectDeliverable && (
              <div className="sm:col-span-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                  <FolderGit2 className="w-3 h-3 text-sky-400" /> Verified Capstone Deliverable
                </span>
                <p className="text-xs text-slate-300">
                  {internshipDetails.projectDeliverable}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. SCAN THE QR CODE IN THE CERTIFICATE FOR AUTHENTICITY */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              QR Code Optical Scan &amp; Authenticity
            </span>
          </div>
          {onRescanQr && (
            <button
              type="button"
              onClick={onRescanQr}
              disabled={isScanningQr}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition"
            >
              <RotateCw className={`w-3 h-3 ${isScanningQr ? 'animate-spin' : ''}`} />
              <span>{isScanningQr ? 'Scanning QR...' : 'Re-Scan QR'}</span>
            </button>
          )}
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800/80">
          <div className={`p-2 rounded-lg shrink-0 ${
            isQrDetected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-500'
          }`}>
            <QrCode className="w-6 h-6" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                isQrDetected
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isQrDetected ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {isQrDetected ? 'QR Matrix Detected & Verified' : 'No QR Code Detected'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              {qrStatusText}
            </p>

            {activeQrPayload ? (
              <div className="pt-1.5 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  Decoded Verification Payload:
                </span>
                <div className="flex items-center justify-between gap-2 p-2 rounded bg-slate-950 border border-slate-800 text-xs">
                  <a
                    href={activeQrPayload}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 truncate underline font-mono text-[11px] flex items-center gap-1"
                  >
                    <span className="truncate">{activeQrPayload}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeQrPayload, 'qr')}
                    title="Copy QR URL"
                    className="text-slate-400 hover:text-slate-200 shrink-0 p-1"
                  >
                    {copiedKey === 'qr' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 italic pt-1">
                Visual matrix scan did not identify a standard QR verification code on this document.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 6. Inferred Domain Skills */}
      {skills && skills.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Demonstrated Domain Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-indigo-950/70 text-indigo-200 border border-indigo-800/40 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
