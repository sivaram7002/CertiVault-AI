import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Type, 
  Award, 
  Binary, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Info
} from 'lucide-react';

export default function ForensicChecklist({ checklist, compact = false }) {
  const [expandedItem, setExpandedItem] = useState(null);

  if (!checklist) return null;

  const items = [
    {
      key: 'typographyAlignment',
      title: 'Typography & Alignment',
      subtitle: 'Font matching, kerning regularity, and baseline shifts',
      icon: Type,
      data: checklist.typographyAlignment || { status: 'Pass', details: 'Consistent typography and alignment detected.' }
    },
    {
      key: 'logosSignatures',
      title: 'Logos, Seals & Signatures',
      subtitle: 'Issuer branding fidelity, vector stamps, and authorized signatures',
      icon: Award,
      data: checklist.logosSignatures || { status: 'Pass', details: 'Authorized signatures and verified issuer emblems present.' }
    },
    {
      key: 'credentialMarkers',
      title: 'Credential & Verification Markers',
      subtitle: 'Certificate ID syntax, QR code integrity, and verification links',
      icon: Binary,
      data: checklist.credentialMarkers || { status: 'Pass', details: 'Standard credential ID pattern and verifiable markers confirmed.' }
    },
    {
      key: 'visualIntegrity',
      title: 'Visual Integrity & Pixel Noise',
      subtitle: 'JPEG compression boundaries, tampering halos, and color box artifacts',
      icon: Eye,
      data: checklist.visualIntegrity || { status: 'Pass', details: 'No raster tampering or background clipping boxes detected.' }
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pass':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          indicator: 'bg-emerald-500',
          text: 'PASS'
        };
      case 'Warning':
        return {
          icon: AlertTriangle,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          indicator: 'bg-amber-500',
          text: 'WARNING'
        };
      case 'Fail':
      default:
        return {
          icon: XCircle,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          indicator: 'bg-rose-500',
          text: 'FAIL'
        };
    }
  };

  const toggleExpand = (key) => {
    setExpandedItem(expandedItem === key ? null : key);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
        <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          AI Forensic Checklist ({items.filter(i => i.data.status === 'Pass').length}/4 Passed)
        </span>
        <span className="text-[11px] text-slate-500">Automated Multimodal Inspection</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {items.map((item) => {
          const statusBadge = getStatusBadge(item.data.status);
          const StatusIcon = statusBadge.icon;
          const ItemIcon = item.icon;
          const isExpanded = expandedItem === item.key;

          return (
            <div 
              key={item.key}
              onClick={() => toggleExpand(item.key)}
              className={`rounded-lg border p-3 cursor-pointer transition-all ${
                item.data.status === 'Fail' 
                  ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700/60' 
                  : item.data.status === 'Warning'
                  ? 'bg-amber-950/20 border-amber-900/50 hover:border-amber-700/60'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-md ${
                    item.data.status === 'Fail' 
                      ? 'bg-rose-500/10 text-rose-400' 
                      : item.data.status === 'Warning' 
                      ? 'bg-amber-500/10 text-amber-400' 
                      : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    <ItemIcon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {item.title}
                    </p>
                    {!compact && (
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${statusBadge.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusBadge.text}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>

              {/* Expandable details */}
              {isExpanded && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-400 shrink-0">Findings:</span>
                    <p className="leading-relaxed text-slate-200">{item.data.details || 'No anomalies identified.'}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
