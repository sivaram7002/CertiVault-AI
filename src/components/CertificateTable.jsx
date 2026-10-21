import React from 'react';
import { Award, Clock, Calendar, Search, Download, Trash2, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function CertificateTable({ certificates, onInspect, onDownload, onDelete }) {
  if (!certificates || certificates.length === 0) return null;

  const getStatusBadge = (status, score) => {
    if (status === 'Verified Authentic') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified ({score})</span>
        </span>
      );
    } else if (status === 'Suspicious / Needs Review') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Suspicious ({score})</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Fraud Alert ({score})</span>
        </span>
      );
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th scope="col" className="px-4 py-3.5">Name on Certificate</th>
              <th scope="col" className="px-4 py-3.5">Course / Program Title</th>
              <th scope="col" className="px-4 py-3.5">Platform</th>
              <th scope="col" className="px-4 py-3.5">Duration</th>
              <th scope="col" className="px-4 py-3.5">Authenticity &amp; Trust</th>
              <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {certificates.map((cert) => (
              <tr 
                key={cert.id}
                className="hover:bg-slate-900/50 transition cursor-pointer group"
                onClick={() => onInspect(cert)}
              >
                {/* Name on Certificate */}
                <td className="px-4 py-3.5 font-bold text-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span>{cert.studentName}</span>
                  </div>
                </td>

                {/* Course Title */}
                <td className="px-4 py-3.5 font-semibold text-slate-200 group-hover:text-indigo-300 transition max-w-xs truncate">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="truncate">{cert.courseTitle}</span>
                  </div>
                </td>

                {/* Platform */}
                <td className="px-4 py-3.5">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-mono text-[11px]">
                    {cert.platform}
                  </span>
                </td>

                {/* Duration */}
                <td className="px-4 py-3.5 text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cert.totalDuration || 'N/A'}</span>
                  </div>
                </td>

                {/* Authenticity Status */}
                <td className="px-4 py-3.5">
                  {getStatusBadge(cert.authenticityStatus, cert.trustScore)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onInspect(cert)}
                    title="View Inspection Report"
                    className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDownload(cert)}
                    title="Download Certificate"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(cert.id)}
                    title="Delete"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
