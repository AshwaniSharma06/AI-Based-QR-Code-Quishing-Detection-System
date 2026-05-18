import React from 'react';
import { AlertTriangle, AlertCircle, Search, ShieldAlert, Link } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WarningList({ warnings = [] }) {
  // Animation variants for staggering children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20, filter: 'blur(5px)' },
    show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Helper to pick a contextual icon based on the warning text
  const getIcon = (text) => {
    const t = text.toLowerCase();
    if (t.includes('domain')) return <Search className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />;
    if (t.includes('https') || t.includes('ssl') || t.includes('encryption')) return <ShieldAlert className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />;
    if (t.includes('url') || t.includes('shortener')) return <Link className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />;
    if (t.includes('phishing')) return <AlertTriangle className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />;
    return <AlertCircle className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />;
  };

  if (!warnings || warnings.length === 0) return null;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3 font-sans w-full"
    >
      {warnings.map((warn, index) => (
        <motion.div 
          key={index}
          variants={item}
          className="group relative overflow-hidden rounded-xl bg-red-950/30 border border-red-500/20 hover:border-red-500/50 transition-colors p-3.5 flex items-start gap-4 shadow-[0_4px_20px_rgba(239,68,68,0.05)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.15)]"
        >
          {/* Subtle animated light sweep on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
          
          {/* Icon Container */}
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            {getIcon(warn)}
          </div>
          
          {/* Text Content */}
          <div className="flex-1 pt-0.5">
            <h4 className="text-xs font-bold text-red-200 uppercase tracking-wider mb-1">Detected Threat</h4>
            <p className="text-sm text-red-400/90 leading-relaxed font-medium">
              {warn}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
