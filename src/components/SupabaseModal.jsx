import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Cloud, 
  RefreshCw, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  EyeOff,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  clearStoredSupabaseConfig, 
  testSupabaseConnection, 
  syncLocalCertificatesToSupabase,
  SUPABASE_SCHEMA_SQL 
} from '../services/supabase';
import { getLocalCertificates } from '../services/storage';

export default function SupabaseModal({ isOpen, onClose, onConfigUpdated }) {
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'guide'
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success, message, tableMissing }
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      setUrl(config.url || '');
      setAnonKey(config.anonKey || '');
      setTestResult(null);
      setSaveSuccess(false);
      setSyncStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConnected = Boolean(url && anonKey && url.startsWith('http'));

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Please provide both your Supabase Project URL and Anon Public Key.'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testSupabaseConnection(url.trim(), anonKey.trim());
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed. Please verify your Project URL and anon public key.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    saveStoredSupabaseConfig(url.trim(), anonKey.trim());
    setSaveSuccess(true);
    if (onConfigUpdated) onConfigUpdated();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 700);
  };

  const handleClear = () => {
    clearStoredSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult({
      success: true,
      message: 'Supabase configuration cleared. CertiVault AI is now operating on local IndexedDB storage.'
    });
    if (onConfigUpdated) onConfigUpdated();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSyncLocalToCloud = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const localCerts = await getLocalCertificates();
      if (!localCerts || localCerts.length === 0) {
        setSyncStatus({ success: true, message: 'No local certificates found to sync.' });
        return;
      }

      const count = await syncLocalCertificatesToSupabase(localCerts);
      setSyncStatus({
        success: true,
        message: `Successfully synchronized ${count} certificate${count > 1 ? 's' : ''} to your Supabase Cloud Database!`
      });
      if (onConfigUpdated) onConfigUpdated();
    } catch (err) {
      setSyncStatus({
        success: false,
        message: `Sync failed: ${err.message}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Supabase Cloud Database
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Store uploaded certificates, forensic scans &amp; files in your cloud database
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

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-950/40 border-b border-slate-800 flex gap-4 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Connection &amp; Credentials</span>
          </button>
          
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1-Click Setup Guide &amp; SQL Schema</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {activeTab === 'config' ? (
            <>
              {/* Storage Status Card */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                isConnected 
                  ? 'bg-emerald-950/20 border-emerald-500/30' 
                  : 'bg-amber-950/20 border-amber-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-amber-400 shadow-[0_0_10px_#f59e0b]'}`} />
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">
                      {isConnected ? 'Supabase Database Configured' : 'Local Vault Fallback Active'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isConnected 
                        ? `Connected to: ${url.replace('https://', '').split('.')[0]}.supabase.co` 
                        : 'Certificates are currently saved locally in your browser storage. Connect Supabase to store them in the cloud.'}
                    </p>
                  </div>
                </div>

                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition flex items-center gap-1.5 shrink-0"
                >
                  <span>Supabase Dashboard</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                {/* Supabase URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzabcdefghijklm.supabase.co"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs transition"
                  />
                  <p className="text-[11px] text-slate-400">
                    Found in your Supabase project under: <span className="text-slate-300 font-mono">Project Settings &gt; API &gt; Project URL</span>
                  </p>
                </div>

                {/* Supabase Anon Key */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Supabase Anon Public API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Found in your Supabase project under: <span className="text-slate-300 font-mono">Project Settings &gt; API &gt; Project API keys (anon / public)</span>
                  </p>
                </div>
              </div>

              {/* Test / Feedback Result */}
              {testResult && (
                <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : testResult.tableMissing
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-current" />
                  )}
                  <div className="space-y-1 flex-1">
                    <p className="font-semibold text-xs leading-snug">
                      {testResult.message}
                    </p>
                    {testResult.tableMissing && (
                      <button
                        onClick={() => setActiveTab('guide')}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 underline hover:text-amber-300 mt-1"
                      >
                        <span>View 1-Click SQL Schema instructions</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Sync Status Banner */}
              {syncStatus && (
                <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                  syncStatus.success
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                }`}>
                  {syncStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <p className="text-xs font-semibold">{syncStatus.message}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleTestConnection}
                    disabled={testing || !url.trim() || !anonKey.trim()}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold transition flex items-center justify-center gap-2"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>

                  {isConnected && (
                    <button
                      onClick={handleSyncLocalToCloud}
                      disabled={isSyncing}
                      title="Upload local sample/cached certificates to Supabase"
                      className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium transition flex items-center gap-1.5"
                    >
                      {isSyncing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>Sync to Cloud</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isConnected && (
                    <button
                      onClick={handleClear}
                      className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-medium transition"
                    >
                      Disconnect
                    </button>
                  )}

                  <button
                    onClick={handleSave}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <span>Save &amp; Apply</span>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: 1-Click Guide & SQL Schema */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-200">
                    No Database Experience Needed!
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Supabase provides a free, instant cloud PostgreSQL database. Follow these 4 easy steps to connect your CertiVault in less than 2 minutes.
                  </p>
                </div>
              </div>

              {/* 4 Steps */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-200">Create a Free Project</p>
                    <p className="text-[11px] text-slate-400">
                      Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-medium">supabase.com</a>, sign up for free, and click <strong>"New project"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-200">Open SQL Editor in Supabase</p>
                    <p className="text-[11px] text-slate-400">
                      In the left sidebar of your Supabase dashboard, click <strong>SQL Editor</strong> &gt; <strong>"New query"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div className="space-y-1 w-full">
                    <p className="font-semibold text-slate-200">Copy &amp; Run this SQL Schema</p>
                    <p className="text-[11px] text-slate-400">
                      Click the green <strong>"Copy SQL Code"</strong> button below, paste it into the Supabase SQL editor, and click <strong>"Run"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    4
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-200">Paste Credentials into CertiVault AI</p>
                    <p className="text-[11px] text-slate-400">
                      Go to <strong>Project Settings &gt; API</strong>, copy your <strong>Project URL</strong> &amp; <strong>anon public key</strong>, and paste them in the Connection tab!
                    </p>
                  </div>
                </div>
              </div>

              {/* SQL Code Box with Copy Button */}
              <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-mono text-slate-300 font-semibold">
                      schema.sql (Certificates Table + RLS Policies)
                    </span>
                  </div>

                  <button
                    onClick={handleCopySql}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SQL Code</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60 leading-relaxed scrollbar-thin">
                  {SUPABASE_SCHEMA_SQL}
                </pre>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => setActiveTab('config')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition flex items-center gap-1.5"
                >
                  <span>Back to Connection Settings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
