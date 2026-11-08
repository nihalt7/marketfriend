'use client';

import {
  CheckCircle2,
  Crop,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  UploadCloud,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import React, { useRef, useState } from 'react';

interface ScreenshotUploadAreaProps {
  imagePreview: string | null;
  setImagePreview: (url: string | null) => void;
  setImageBase64: (base64: string | null) => void;
  setMimeType: (mime: string) => void;
  imageQuality: 'good' | 'acceptable' | 'poor' | null;
  setImageQuality: (q: 'good' | 'acceptable' | 'poor' | null) => void;
}

export const ScreenshotUploadArea: React.FC<ScreenshotUploadAreaProps> = ({
  imagePreview,
  setImagePreview,
  setImageBase64,
  setMimeType,
  imageQuality,
  setImageQuality
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const processFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Supported screenshot formats: PNG, JPG, JPEG, WEBP only.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit.');
      return;
    }

    setUploadProgress(10);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 90));
      }
    };

    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64Data = result.split(',')[1] || result;
      setImageBase64(base64Data);
      setUploadProgress(100);

      // Validate resolution
      const img = new Image();
      img.onload = () => {
        if (img.width >= 1000 && img.height >= 500) {
          setImageQuality('good');
        } else if (img.width >= 600 && img.height >= 350) {
          setImageQuality('acceptable');
        } else {
          setImageQuality('poor');
        }
        setTimeout(() => setUploadProgress(null), 400);
      };
      img.src = result;
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setImageQuality(null);
    setZoomLevel(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {!imagePreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 group relative ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
              : 'border-[#1e293b] hover:border-cyan-500/50 bg-[#0d131f]/70 hover:bg-[#0d131f]'
          }`}
        >
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8 text-cyan-400" />
            </div>

            <h3 className="text-base font-semibold text-white mb-1">
              Upload TradingView or Stock Chart Screenshot
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Drag & drop your screenshot here, or <span className="text-cyan-400 underline font-medium">browse files</span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="bg-[#161f30] px-2.5 py-1 rounded border border-[#223049]">PNG</span>
              <span className="bg-[#161f30] px-2.5 py-1 rounded border border-[#223049]">JPG</span>
              <span className="bg-[#161f30] px-2.5 py-1 rounded border border-[#223049]">JPEG</span>
              <span className="bg-[#161f30] px-2.5 py-1 rounded border border-[#223049]">WEBP</span>
              <span className="text-slate-500">• Max 15MB</span>
            </div>
          </div>

          {uploadProgress !== null && (
            <div className="absolute inset-x-8 bottom-4">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#1a2333]">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium text-slate-200">Screenshot Loaded & Ready</span>
              {imageQuality && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                    imageQuality === 'good'
                      ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                      : imageQuality === 'acceptable'
                      ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                      : 'bg-rose-950/80 border-rose-800 text-rose-400'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" /> Quality: {imageQuality.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.0))}
                className="p-1.5 rounded bg-[#161f30] text-slate-300 hover:text-white border border-[#223049]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
                className="p-1.5 rounded bg-[#161f30] text-slate-300 hover:text-white border border-[#223049]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded bg-[#161f30] text-slate-300 hover:text-white border border-[#223049] flex items-center gap-1 text-xs"
                title="Replace Image"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Replace
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="p-1.5 rounded bg-rose-950/50 text-rose-400 hover:bg-rose-900/60 border border-rose-800/60"
                title="Remove Image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="w-full max-h-[340px] overflow-auto rounded-lg bg-[#070a0f] border border-[#161f30] flex items-center justify-center p-2">
            <img
              src={imagePreview}
              alt="Uploaded Trading Chart"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              className="max-h-[300px] object-contain rounded transition-transform duration-150"
            />
          </div>
        </div>
      )}
    </div>
  );
};

