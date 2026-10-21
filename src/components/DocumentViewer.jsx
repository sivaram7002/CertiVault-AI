import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  ExternalLink, 
  Download, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  FileText, 
  RefreshCw,
  Sliders
} from 'lucide-react';

export default function DocumentViewer({ fileData, fileName = 'certificate', fileType = 'application/pdf', externalUrl = '' }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [forensicMode, setForensicMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const isPdf = fileType === 'application/pdf' || (fileData && fileData.startsWith('data:application/pdf'));

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    if (!fileData) return;
    const a = document.createElement('a');
    a.href = fileData;
    a.download = fileName || 'certificate_download';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleOpenNewTab = () => {
    if (!fileData) return;
    const newTab = window.open();
    if (newTab) {
      if (isPdf) {
        newTab.document.write(`<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      } else {
        newTab.document.write(`
          <body style="margin:0; background:#0b1120; display:flex; align-items:center; justify-content:center; height:100vh;">
            <img src="${fileData}" style="max-width:95%; max-height:95%; object-fit:contain; border-radius:8px; box-shadow:0 10px 40px rgba(0,0,0,0.6);" />
          </body>
        `);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden ${
        isFullscreen ? 'p-4 bg-slate-950 z-50' : ''
      }`}
    >
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-10 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded bg-slate-800 text-slate-300">
            <FileText className="w-4 h-4" />
          </span>
          <span className="text-xs font-medium text-slate-300 truncate max-w-[180px]" title={fileName}>
            {fileName}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
            {isPdf ? 'PDF' : fileType.split('/')[1] || 'IMAGE'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Zoom Controls */}
          <button 
            type="button"
            onClick={handleZoomOut} 
            title="Zoom Out"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button 
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="px-2 py-1 rounded-md text-xs font-mono text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button 
            type="button"
            onClick={handleZoomIn} 
            title="Zoom In"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* Rotate */}
          <button 
            type="button"
            onClick={handleRotate} 
            title="Rotate 90°"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Forensic Filter Mode (Inverts colors/contrast to expose text manipulation) */}
          <button 
            type="button"
            onClick={() => setForensicMode(!forensicMode)} 
            title="Forensic Contrast Invert Mode"
            className={`p-1.5 rounded-md transition flex items-center gap-1 text-xs ${
              forensicMode 
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">Forensic Invert</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* Open in New Tab */}
          <button 
            type="button"
            onClick={handleOpenNewTab} 
            title="Open Document in New Tab"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Download */}
          <button 
            type="button"
            onClick={handleDownload} 
            title="Download Document"
            className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-500/10 transition"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button 
            type="button"
            onClick={toggleFullscreen} 
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas / Viewer Body */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-auto bg-slate-950/80">
        {forensicMode && (
          <div className="absolute top-2 left-2 z-20 px-2.5 py-1 rounded bg-indigo-900/80 border border-indigo-500/40 text-[11px] font-mono text-indigo-200">
            FORENSIC FILTER ACTIVE: Inverted Grayscale Contrast
          </div>
        )}

        {isPdf ? (
          <div 
            className="w-full h-full flex flex-col items-center justify-center transition-all duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          >
            <iframe
              src={fileData}
              title={fileName}
              className={`w-full h-full min-h-[420px] rounded-lg border border-slate-800 bg-white ${
                forensicMode ? 'invert contrast-125' : ''
              }`}
            />
          </div>
        ) : (
          <div 
            className="flex items-center justify-center transition-all duration-200 w-full h-full"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          >
            <img
              src={fileData}
              alt={fileName}
              className={`max-w-full max-h-[500px] object-contain rounded-lg shadow-2xl transition duration-300 ${
                forensicMode 
                  ? 'filter invert contrast-150 brightness-90 hue-rotate-180' 
                  : ''
              }`}
            />
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      {externalUrl && (
        <div className="px-3.5 py-2 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-[70%]">External Source: {externalUrl}</span>
          <a 
            href={externalUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium underline"
          >
            Verify External Link <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
