import React, { useRef } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Upload, 
  Download, 
  Key, 
  Cpu, 
  Sparkles,
  Database,
  ExternalLink
} from 'lucide-react';
import { getStoredApiKey, getStoredModel } from '../services/gemini';
import { isSupabaseConfigured } from '../services/supabase';

export default function Navbar({ onOpenUpload, onOpenApiKey, onOpenSupabase, onExport, onImport }) {
  const hasApiKey = Boolean(getStoredApiKey());
  const activeModel = getStoredModel();
  const hasSupabase = isSupabaseConfigured();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          onImport(json);
        } catch (err) {
          alert('Failed to parse backup JSON file: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 p-[1px] shadow-lg shadow-emerald-500/10">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-300 to-indigo-400 tracking-tight leading-none">
                CertiVault AI
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                v2.5 Vision
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight hidden sm:block">
              Course &amp; Internship Vault • Multimodal Fraud Inspection
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase Database Status Pill */}
          <button
            onClick={onOpenSupabase}
            title="Configure Supabase Cloud Database"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 transition group"
          >
            <span className={`w-2 h-2 rounded-full ${hasSupabase ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-slate-500'}`} />
            <Database className={`w-3.5 h-3.5 ${hasSupabase ? 'text-emerald-400' : 'text-slate-400'} group-hover:text-emerald-400 transition`} />
            <span className="hidden md:inline text-slate-300">
              {hasSupabase ? 'Supabase DB' : 'Connect DB'}
            </span>
            <span className="md:hidden text-slate-300">
              {hasSupabase ? 'Supabase' : 'DB'}
            </span>
          </button>

          {/* API Key Status Pill */}
          <button
            onClick={onOpenApiKey}
            title="Configure Google Gemini Vision AI"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 transition group"
          >
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'}`} />
            <span className="hidden md:inline text-slate-300">
              {hasApiKey ? `${activeModel}` : 'Demo Simulation Mode'}
            </span>
            <span className="md:hidden text-slate-300">
              {hasApiKey ? 'AI Ready' : 'Demo AI'}
            </span>
            <Key className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
          </button>

          {/* Export / Import Vault */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={onExport}
              title="Export Vault as JSON backup"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[11px]">Export</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import JSON backup"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1 text-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="text-[11px]">Import</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* New Certificate Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Deposit Certificate</span>
          </button>
        </div>
      </div>
    </header>
  );
}
