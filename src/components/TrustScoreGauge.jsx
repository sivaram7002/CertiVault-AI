import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function TrustScoreGauge({ score = 0, status = '', size = 'md', showLabel = true }) {
  // Clamp score
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));

  // Color mapping based on score
  const getColor = () => {
    if (safeScore >= 85) {
      return {
        stroke: '#10b981',
        glow: 'rgba(16, 185, 129, 0.4)',
        bg: 'rgba(16, 185, 129, 0.1)',
        text: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: ShieldCheck,
        label: 'Verified Authentic'
      };
    } else if (safeScore >= 60) {
      return {
        stroke: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.4)',
        bg: 'rgba(245, 158, 11, 0.1)',
        text: 'text-amber-400',
        badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        icon: AlertTriangle,
        label: 'Suspicious / Needs Review'
      };
    } else {
      return {
        stroke: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.4)',
        bg: 'rgba(239, 68, 68, 0.1)',
        text: 'text-rose-400',
        badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        icon: ShieldAlert,
        label: 'Potentially Fraudulent'
      };
    }
  };

  const colorMeta = getColor();
  const IconComponent = colorMeta.icon;

  // Dimensions based on size
  const config = {
    sm: { dimension: 56, strokeWidth: 5, fontSize: 'text-xs', subFont: 'text-[9px]' },
    md: { dimension: 88, strokeWidth: 7, fontSize: 'text-xl', subFont: 'text-[11px]' },
    lg: { dimension: 130, strokeWidth: 10, fontSize: 'text-3xl', subFont: 'text-xs' }
  }[size] || { dimension: 88, strokeWidth: 7, fontSize: 'text-xl', subFont: 'text-[11px]' };

  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div 
        className="relative flex items-center justify-center transition-transform hover:scale-105"
        style={{ width: config.dimension, height: config.dimension }}
      >
        <svg 
          width={config.dimension} 
          height={config.dimension} 
          className="transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
        >
          {/* Background circle track */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress gauge */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="transparent"
            stroke={colorMeta.stroke}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${colorMeta.glow})`
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-bold leading-none ${config.fontSize} ${colorMeta.text}`}>
            {safeScore}
          </span>
          <span className={`font-mono text-slate-400 uppercase tracking-tighter ${config.subFont}`}>
            /100
          </span>
        </div>
      </div>

      {showLabel && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${colorMeta.badgeBg}`}>
          <IconComponent className="w-3.5 h-3.5" />
          <span>{status || colorMeta.label}</span>
        </div>
      )}
    </div>
  );
}
