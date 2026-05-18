import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';

export default function UploadQR({ onUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    setFile(selectedFile);

    // Create preview and decode QR
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          if (onUpload) {
            onUpload(code.data); // Pass the decoded text (URL)
          }
        } else {
          setError("No QR code found in the image. Please ensure the QR code is clear.");
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation(); // prevent triggering click on parent
    setFile(null);
    setPreview(null);
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto font-sans">
      <div
        className={`relative group flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer
          ${dragActive
            ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]'
            : 'border-cyan-500/30 bg-[#0A1128]/50 hover:bg-[#0A1128]/80 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 p-4 flex flex-col items-center justify-center bg-[#050B14]/90 backdrop-blur-sm z-10"
            >
              <button
                onClick={clearFile}
                className="absolute top-4 right-4 p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative w-32 h-32 mb-4 rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <img src={preview} alt="QR Preview" className="w-full h-full object-cover" />
                {/* Scanline effect over preview */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 opacity-50 animate-[scan_2s_ease-in-out_infinite]" />
              </div>

              <div className="flex items-center gap-2 text-sm text-cyan-400 font-medium z-20">
                <FileImage className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-[200px]">{file?.name}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-4 p-6 text-center z-10 pointer-events-none"
            >
              <div className={`p-4 rounded-full bg-cyan-500/10 border transition-colors duration-300 ${dragActive ? 'border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-110' : 'border-cyan-500/20 text-cyan-500 group-hover:border-cyan-400/50 group-hover:text-cyan-400'}`}>
                <UploadCloud className={`w-8 h-8 transition-transform duration-300 ${dragActive ? 'animate-bounce' : 'group-hover:-translate-y-1'}`} />
              </div>

              <div>
                <p className="text-base font-semibold text-white mb-1">
                  Click to upload <span className="text-gray-400 font-normal">or drag & drop</span>
                </p>
                <p className="text-xs text-gray-500">
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
