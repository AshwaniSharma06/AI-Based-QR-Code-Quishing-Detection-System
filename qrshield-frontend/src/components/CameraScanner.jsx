import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Focus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';

export default function CameraScanner({ onScan }) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  const startCamera = async () => {
    setError('');
    setIsScanning(true);
    
    // Give the DOM a tiny bit of time to ensure the #qr-reader div is ready
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // Success!
            if (onScan) {
              // Stop scanning first, then trigger callback
              html5QrCode.stop().then(() => {
                setIsScanning(false);
                onScan(decodedText);
              }).catch(err => console.error("Failed to stop", err));
            }
          },
          (errorMessage) => {
            // This fires every frame a QR code ISN'T found. We ignore it.
          }
        );
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please check permissions.');
        setIsScanning(false);
      }
    }, 100);
  };

  const stopCamera = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        setIsScanning(false);
      }).catch(err => {
        console.error("Failed to clear scanner", err);
        setIsScanning(false);
      });
    } else {
      setIsScanning(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto font-sans">
      <div className="relative flex flex-col items-center justify-center w-full h-80 rounded-2xl border border-cyan-500/30 bg-[#0A1128]/50 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.1)] overflow-hidden">

        {/* Animated background glow when not scanning */}
        {!isScanning && (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 animate-pulse" />
        )}

        <div
          id="qr-reader"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 [&>video]:object-cover [&>video]:w-full [&>video]:h-full ${isScanning ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* UI Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col">
          <AnimatePresence>
            {isScanning ? (
              <motion.div
                key="scanning-ui"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative pointer-events-none"
              >
                {/* Scanner Frame */}
                <div className="absolute inset-0 p-8 flex items-center justify-center">
                  <div className="relative w-full aspect-square border-2 border-cyan-400/50 rounded-lg overflow-hidden">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

                    {/* Animated Scan Line */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-[scan_2s_ease-in-out_infinite]" />
                    <style>{`
                      @keyframes scan {
                        0%, 100% { top: 0%; opacity: 0; }
                        10%, 90% { opacity: 1; }
                        50% { top: 100%; }
                      }
                    `}</style>
                  </div>
                </div>

                <div className="absolute top-4 w-full flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-[#050B14]/80 backdrop-blur-sm border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Focus className="w-3 h-3 animate-pulse" />
                    Scanning QR Code...
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle-ui"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center pointer-events-none p-6 text-center"
              >
                <div className="p-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 mb-4 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Camera Access Required</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Grant permission to use your camera to scan QR codes securely in real-time.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-center">
        {isScanning ? (
          <button
            onClick={stopCamera}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 font-semibold hover:bg-red-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <CameraOff className="w-5 h-5" />
            <span>Stop Scanning</span>
          </button>
        ) : (
          <button
            onClick={startCamera}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-semibold hover:bg-cyan-500 hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.2)] group"
          >
            <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Start Scanner</span>
          </button>
        )}
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
