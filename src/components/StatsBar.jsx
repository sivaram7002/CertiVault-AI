import React from 'react';
import { Award, ShieldCheck, Layers, ShieldAlert, Sparkles } from 'lucide-react';

export default function StatsBar({ certificates = [] }) {
  const total = certificates.length;

  const verifiedCount = certificates.filter(c => c.authenticityStatus === 'Verified Authentic').length;
  const suspiciousCount = certificates.filter(c => c.authenticityStatus === 'Suspicious / Needs Review').length;
  const fraudCount = certificates.filter(c => c.authenticityStatus === 'Potentially Fraudulent').length;
  const alertTotal = suspiciousCount + fraudCount;

  // Unique platforms
  const platforms = new Set(certificates.map(c => c.platform?.split('/')[0]?.trim()).filter(Boolean));
  const uniquePlatformCount = platforms.size;

  // Category counts
  const coursesCount = certificates.filter(c => c.category === 'Course').length;
  const internshipsCount = certificates.filter(c => c.category === 'Internship').length;
  const codingCount = certificates.filter(c => c.category === 'Coding / Hackathon').length;

  const verifiedPercent = total > 0 ? Math.round((verifiedCount / total) * 100) : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Certificates */}
      <div className="glass-panel rounded-xl p-4 relative overflow-hidden border border-slate-800/80 hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vault Repository</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-100 font-mono">{total}</span>
          <span className="text-xs text-slate-400">Certificates</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="text-emerald-400 font-medium">{verifiedCount} Verified</span>
          <span>•</span>
          <span className="text-slate-300 font-medium">{uniquePlatformCount} Issuing Platforms</span>
        </div>
      </div>

      {/* 2. Verified Authentic */}
      <div className="glass-panel rounded-xl p-4 relative overflow-hidden border border-emerald-900/30 hover:border-emerald-600/40 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Verified Authentic</span>
          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-400 font-mono">{verifiedCount}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            {verifiedPercent}% Pass Rate
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>High-trust cryptographic &amp; forensic rating</span>
        </div>
      </div>

      {/* 3. Unique Platforms */}
      <div className="glass-panel rounded-xl p-4 relative overflow-hidden border border-slate-800/80 hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issuing Platforms</span>
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-100 font-mono">{uniquePlatformCount}</span>
          <span className="text-xs text-slate-400">Unique Issuers</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 truncate">
          {Array.from(platforms).slice(0, 3).join(', ')}
          {platforms.size > 3 ? ` +${platforms.size - 3} more` : ''}
        </div>
      </div>

      {/* 4. Fraud & Suspicious Alerts */}
      <div className={`glass-panel rounded-xl p-4 relative overflow-hidden transition border ${
        alertTotal > 0 
          ? 'border-rose-900/50 bg-rose-950/10 hover:border-rose-700/60' 
          : 'border-slate-800/80 hover:border-slate-700'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${
            alertTotal > 0 ? 'text-rose-400' : 'text-slate-400'
          }`}>
            Forensic Risk Alerts
          </span>
          <div className={`p-2 rounded-lg ${
            alertTotal > 0 ? 'bg-rose-500/15 text-rose-400' : 'bg-slate-800 text-slate-400'
          }`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-3xl font-extrabold font-mono ${
            alertTotal > 0 ? 'text-rose-400' : 'text-slate-200'
          }`}>
            {alertTotal}
          </span>
          {alertTotal > 0 ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
              {fraudCount} Fraud, {suspiciousCount} Review
            </span>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              Zero Flags
            </span>
          )}
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          {alertTotal > 0 ? 'Mismatched fonts or raster tampering detected' : 'All certificates visually and structurally sound'}
        </div>
      </div>
    </div>
  );
}