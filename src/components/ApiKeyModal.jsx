import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  getStoredApiKey, 
  saveStoredApiKey, 
  getStoredModel, 
  saveStoredModel, 
  testApiKey 
} from '../services/gemini';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { success: boolean, message: string }
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setModel(getStoredModel());
      setTestStatus(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus({ success: false, message: 'Please enter a Gemini API Key to test.' });
      return;
    }

    setTesting(true);
    setTestStatus(null);

    try {
      await testApiKey(apiKey.trim(), model);
      setTestStatus({
        success: true,
        message: `Successfully connected to Google Gemini API using model "${model}"!`
      });
    } catch (err) {
      setTestStatus({
        success: false,
        message: err.message || 'Connection failed. Please verify your API key.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    saveStoredApiKey(apiKey.trim());
    saveStoredModel(model);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    saveStoredApiKey('');
    setApiKey('');
    setTestStatus({
      success: true,
      message: 'API Key cleared. The app will now use the Intelligent Built-in Forensic Engine.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Gemini AI Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Configure multimodal model for document vision &amp; fraud detection
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          {/* Free API Key Banner */}
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">
                Multimodal Vision Powered by Google Gemini
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                CertiVault AI uses <code className="text-emerald-400 font-mono">gemini-2.5-flash</code> for instantaneous OCR extraction and forensic pixel inspection. You can grab a free API key from Google AI Studio.
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline mt-1"
              >
                Get Free Gemini API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Selected Vision Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Fastest &amp; Recommended for Multimodal)</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash (Standard Multimodal)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (High-Precision Reasoning)</option>
            </select>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                Google Gemini API Key
              </label>
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Clear Key
                </button>
              )}
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-500">
              Key is stored locally in your browser’s localStorage. If left blank, CertiVault AI operates seamlessly in Built-in Forensic Mode!
            </p>
          </div>

          {/* Test Status Banner */}
          {testStatus && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              testStatus.success 
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' 
                : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
            }`}>
              {testStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{testStatus.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !apiKey.trim()}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white hover:bg-indigo-600/20 border border-indigo-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{saveSuccess ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
