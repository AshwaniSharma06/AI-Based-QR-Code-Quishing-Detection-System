import React, { useState, useEffect } from 'react';
import { Shield, Activity, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  "Analyzing QR Security...",
  "Checking phishing indicators...",
  "Running AI threat detection...",
  "Verifying domain reputation...",
  "Securing payload..."
];

export default function AILoadingScreen() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050B14]/95 backdrop-blur-xl font-sans overflow-hidden">
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Loader Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Holographic Circular Scanner */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-12">
          {/* Outer dashed rotating ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-cyan-500/30 rounded-full"
          />
          
          {/* Inner fast rotating ring */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border-2 border-transparent border-t-cyan-400 border-b-blue-500 rounded-full opacity-70"
          />

          {/* Pulse ring */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 border-2 border-cyan-400 rounded-full"
          />

          {/* Center Icon Platform */}
          <div className="relative w-24 h-24 bg-[#0A1128] border border-cyan-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)] overflow-hidden">
            {/* Radar Sweep Effect */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full"
            >
              <div className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left bg-gradient-to-tr from-cyan-400/0 via-cyan-400/20 to-cyan-400/60 blur-md" />
            </motion.div>
            
            {/* Center Icon */}
            <motion.div
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <Shield className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
            </motion.div>
          </div>
        </div>

        {/* Text Container */}
        <div className="h-16 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
              transition={{ duration: 0.4 }}
              className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-wide text-center"
            >
              {messages[step]}
            </motion.p>
          </AnimatePresence>
          
          <div className="flex items-center gap-3 mt-4">
            <motion.div 
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            />
            <motion.div 
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            />
            <motion.div 
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            />
          </div>
        </div>

      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-10 left-10 hidden md:flex items-center gap-2 text-cyan-500/50">
        <Activity className="w-5 h-5 animate-pulse" />
        <span className="text-xs font-mono tracking-widest uppercase">SYS.OP.NORMAL</span>
      </div>
      
      <div className="absolute bottom-10 right-10 hidden md:flex items-center gap-2 text-cyan-500/50">
        <span className="text-xs font-mono tracking-widest uppercase">SECURE.CON</span>
        <Lock className="w-5 h-5" />
      </div>
    </div>
  );
}
