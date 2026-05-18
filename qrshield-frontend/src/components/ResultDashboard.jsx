import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, ExternalLink, ArrowLeft, AlertTriangle, CheckCircle, Activity, Globe, Copy, Check, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import RiskMeter from './RiskMeter';
import WarningList from './WarningList';

export default function ResultDashboard({ result, onClose }) {
  const [copied, setCopied] = useState(false);
  const [confirmUnsafe, setConfirmUnsafe] = useState(false);

  const { isSafe, url, riskScore, threatLevel, summary, warnings } = result || {
    isSafe: false,
    url: "http://example-phishing-login.com/secure/login",
    riskScore: 89,
    threatLevel: "CRITICAL",
    summary: "High probability of phishing. The domain was registered recently and mimics a legitimate banking portal.",
    warnings: ["Suspicious domain age (2 days)", "No SSL certificate", "Known phishing signature detected"]
  };

  const handleCopy = () => {
    if (url) navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceed = () => {
    if (!isSafe && !confirmUnsafe) {
      setConfirmUnsafe(true);
      return;
    }
    // Only open if URL exists
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const theme = isSafe ? {
    bgGradient: "from-green-500/10 to-emerald-600/10",
    border: "border-green-500/30",
    text: "text-green-400",
    shadow: "shadow-[0_0_30px_rgba(34,197,94,0.15)]",
    badgeBg: "bg-green-500/10",
    ring1: "border-green-500/20",
    ring2: "border-green-500/10",
    warningBox: "bg-green-500/5",
    icon: <ShieldCheck className="w-16 h-16 text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
  } : {
    bgGradient: "from-red-500/10 to-rose-600/10",
    border: "border-red-500/30",
    text: "text-red-400",
    shadow: "shadow-[0_0_30px_rgba(239,68,68,0.15)]",
    badgeBg: "bg-red-500/10",
    ring1: "border-red-500/20",
    ring2: "border-red-500/10",
    warningBox: "bg-red-500/5",
    icon: <ShieldAlert className="w-16 h-16 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" />
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`relative w-full rounded-3xl border ${theme.border} bg-[#0A1128]/80 backdrop-blur-xl ${theme.shadow} overflow-hidden`}
      >
        {/* Animated Background Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
        
        {/* Top Header Section */}
        <div className={`relative p-8 border-b ${theme.border} flex flex-col md:flex-row items-center gap-6 md:gap-10`}>
          {/* Status Icon */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className={`w-32 h-32 rounded-full flex items-center justify-center bg-[#050B14] border-2 ${theme.border} shrink-0 relative`}
          >
            {/* Radar ring */}
            <div className={`absolute inset-[-10px] rounded-full border ${theme.ring1} animate-[spin_4s_linear_infinite]`} />
            <div className={`absolute inset-[-20px] rounded-full border ${theme.ring2} animate-[spin_6s_linear_infinite_reverse]`} />
            {theme.icon}
          </motion.div>

          {/* Status Details */}
          <div className="flex-1 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.badgeBg} border ${theme.border} ${theme.text} text-xs font-bold uppercase tracking-widest mb-3`}
            >
              <Activity className="w-3 h-3" />
              <span>Threat Level: {threatLevel}</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl font-extrabold text-white mb-2"
            >
              {isSafe ? "Safe to Scan" : "Malicious QR Detected"}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-sm md:text-base max-w-xl mx-auto md:mx-0"
            >
              {summary}
            </motion.p>
          </div>

          {/* Risk Score */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center justify-center shrink-0 mt-6 md:mt-0"
          >
            <RiskMeter score={riskScore} size={110} />
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="relative p-8 grid md:grid-cols-2 gap-8 bg-[#050B14]/40">
          
          {/* Target URL */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="col-span-1 md:col-span-2 space-y-3"
          >
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Target URL Destination</h3>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-900/50 border border-gray-800 font-mono text-sm text-white group hover:border-gray-700 transition-colors">
              <Globe className="w-5 h-5 text-cyan-500 shrink-0" />
              <span className="flex-1 break-all line-clamp-2">{url}</span>
              <button 
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-cyan-400 transition-colors shrink-0"
                title="Copy URL"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>

          {/* AI Analysis Log */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Analysis Log</h3>
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-3 h-full">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Domain Reputation</span>
                <span className={isSafe ? "text-green-400 font-medium" : "text-red-400 font-medium"}>{isSafe ? "Clean" : "Flagged"}</span>
              </div>
              <div className="w-full h-px bg-gray-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">SSL Certificate</span>
                <span className={isSafe ? "text-green-400 font-medium" : "text-red-400 font-medium"}>{isSafe ? "Valid" : "Missing/Invalid"}</span>
              </div>
              <div className="w-full h-px bg-gray-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Phishing Signatures</span>
                <span className={isSafe ? "text-green-400 font-medium" : "text-red-400 font-medium"}>{isSafe ? "None Detected" : "Match Found"}</span>
              </div>
            </div>
          </motion.div>

          {/* Warning List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Key Indicators</h3>
            {isSafe ? (
              <div className={`p-4 rounded-xl ${theme.warningBox} border ${theme.border} h-full`}>
                {warnings && warnings.length > 0 ? (
                  <ul className="space-y-3">
                    {warnings.map((warn, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>No suspicious indicators found.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full">
                <WarningList warnings={warnings} />
              </div>
            )}
          </motion.div>

        </div>

        {/* Footer Actions */}
        <div className={`relative p-6 border-t ${theme.border} bg-[#0A1128] flex flex-col md:flex-row items-center justify-between gap-4`}>
          
          {/* Left side: Report false positive */}
          <div className="flex-1 w-full md:w-auto flex justify-center md:justify-start">
            {!isSafe && (
              <button 
                onClick={() => alert("Reported to security team. Thank you!")}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Flag className="w-4 h-4" />
                <span>Report False Positive</span>
              </button>
            )}
          </div>

          {/* Right side: Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-4 w-full md:w-auto">
            <button 
              onClick={onClose}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-semibold hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            
            <button 
              onClick={handleProceed}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
                isSafe 
                ? 'bg-green-500 text-black hover:bg-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]' 
                : confirmUnsafe
                  ? 'bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] border border-red-500'
                  : 'bg-red-500/10 border border-red-500 text-red-400 hover:bg-red-500/20'
              }`}
            >
              <span>
                {isSafe 
                  ? "Proceed to Website" 
                  : confirmUnsafe 
                    ? "Click to Confirm Unsafe Visit" 
                    : "Proceed Anyway (Unsafe)"}
              </span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
