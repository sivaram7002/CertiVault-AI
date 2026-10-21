import React from 'react';
import { 
  Award, 
  Clock, 
  Calendar, 
  ExternalLink, 
  Download, 
  Trash2, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert,
  Search,
  Hash,
  Eye,
  Lock
} from 'lucide-react';
import TrustScoreGauge from './TrustScoreGauge';

export default function CertificateCard({ certificate, onInspect, onDelete, onDownload }) {
  const {
    id,
    courseTitle,
    studentName,
    platform,
    category,
    totalDuration,
    issueDate,
    credentialId,
    skills = [],
    authenticityStatus,
    trustScore = 0,
    forensicSummary,
    fileData
  } = certificate;

  // Category badge colors
  const getCategoryBadge = () => {
    switch (category) {
      case 'Internship':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'Coding / Hackathon':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Workshop':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Course':
      default:
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    }
  };

  // Status border highlight
  const getBorderHighlight = () => {
    if (authenticityStatus === 'Potentially Fraudulent') {
      return 'border-rose-900/40 hover:border-rose-600/60 shadow-[0_4px_20px_rgba(239,68,68,0.08)]';
    } else if (authenticityStatus === 'Suspicious / Needs Review') {
      return 'border-amber-900/40 hover:border-amber-600/60 shadow-[0_4px_20px_rgba(245,158,11,0.08)]';
    }
    return 'border-slate-800/80 hover:border-emerald-600/40 shadow-[0_4px_20px_rgba(16,185,129,0.05)]';
  };

  return (
    <div className={`glass-panel glass-panel-hover rounded-2xl flex flex-col justify-between overflow-hidden relative group border transition-all ${getBorderHighlight()}`}>
      {/* Top Banner / Platform Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* Platform & Private Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800/90 text-slate-200 border border-slate-700/60 flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              {platform || 'Issuer'}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-indigo-400" />
              Private
            </span>
          </div>

          {/* Mini Trust Score */}
          <div className="shrink-0">
            <TrustScoreGauge score={trustScore} status={authenticityStatus} size="sm" showLabel={false} />
          </div>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onInspect(certificate)} 
          className="text-sm font-bold text-slate-100 hover:text-indigo-300 transition cursor-pointer line-clamp-2 leading-snug"
          title={courseTitle}
        >
          {courseTitle || 'Untitled Certificate'}
        </h3>

        {/* Prominent Name on Certificate Display */}
        <div className="mt-2.5 p-2 rounded-lg bg-slate-900/90 border border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold leading-none">Name on Certificate</span>
              <span className="font-bold text-slate-100 text-xs truncate block mt-0.5">{studentName || 'Student Name'}</span>
            </div>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium shrink-0">
            Verified Name
          </span>
        </div>
      </div>

      {/* Interactive Certificate Preview Thumbnail (clickable to inspect) */}
      <div 
        onClick={() => onInspect(certificate)}
        className="relative mx-4 my-1 h-36 bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden cursor-pointer group/thumb flex items-center justify-center"
      >
        {fileData ? (
          <img
            src={fileData}
            alt={courseTitle}
            className="w-full h-full object-cover object-top opacity-85 group-hover/thumb:opacity-100 group-hover/thumb:scale-105 transition-all duration-300"
          />
        ) : (
          <div className="text-slate-600 flex flex-col items-center gap-1">
            <Award className="w-8 h-8" />
            <span className="text-[11px]">No preview available</span>
          </div>
        )}

        {/* Hover Inspect Overlay */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
          <span className="px-3 py-1.5 rounded-lg bg-indigo-600/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg transform -translate-y-1 group-hover/thumb:translate-y-0 transition">
            <Eye className="w-3.5 h-3.5" /> Inspect Document &amp; Forensics
          </span>
        </div>

        {/* Fraud Banner tag on preview if tampered */}
        {authenticityStatus === 'Potentially Fraudulent' && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-rose-600/90 text-white text-[10px] font-bold tracking-wider uppercase border border-rose-400/30 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Forensic Red Flag
          </div>
        )}
      </div>

      {/* Middle Metadata Details */}
      <div className="p-4 pt-2 space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate text-slate-300 font-medium">{totalDuration || 'Duration N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{certificate.dateOfCompletion || certificate.issueDate || 'Date N/A'}</span>
          </div>
        </div>

        {/* QR & Credential status */}
        <div className="flex items-center justify-between gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2 py-1 rounded border border-slate-800/60">
          <div className="flex items-center gap-1.5 truncate">
            <Hash className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{credentialId}</span>
          </div>
          {(certificate.qrCodeData?.detected || certificate.verificationUrl) && (
            <span className="text-[10px] text-emerald-400 font-semibold shrink-0">
              QR Verified
            </span>
          )}
        </div>

        {/* Skill Tags */}
        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px] font-medium border border-slate-700/50"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400 text-[10px]">
                +{skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="p-3 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onInspect(certificate)}
          className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-indigo-500/30"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Forensic Report</span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onDownload(certificate)}
            title="Download Document"
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => onDelete(certificate.id)}
            title="Delete from Vault"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
