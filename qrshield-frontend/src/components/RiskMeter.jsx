import React from 'react';
import { motion } from 'framer-motion';

export default function RiskMeter({ score = 0, size = 120 }) {
  // Clamp score between 0 and 100
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  
  // Determine colors based on threat thresholds
  let colorClass = "text-green-400";
  let strokeClass = "stroke-green-400";
  let dropShadow = "drop-shadow-[0_0_12px_rgba(74,222,128,0.6)]";
  
  if (normalizedScore > 30 && normalizedScore <= 70) {
    colorClass = "text-yellow-400";
    strokeClass = "stroke-yellow-400";
    dropShadow = "drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]";
  } else if (normalizedScore > 70) {
    colorClass = "text-red-500";
    strokeClass = "stroke-red-500";
    dropShadow = "drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]";
  }

  // Calculate SVG circle properties
  const strokeWidth = 8;
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.2
  const strokeDashoffset = circumference - (circumference * normalizedScore) / 100;

  return (
    <div 
      className="relative flex items-center justify-center font-sans"
      style={{ width: size, height: size }}
    >
      {/* Subtle background glow/border for the container */}
      <div className="absolute inset-0 rounded-full border border-gray-700/30 opacity-50" />
      
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background Track */}
        <circle 
          cx="50" 
          cy="50" 
          r={radius} 
          className="stroke-[#0A1128] drop-shadow-md" 
          strokeWidth={strokeWidth} 
          fill="none" 
        />
        
        {/* Animated Progress Ring */}
        <motion.circle 
          cx="50" 
          cy="50" 
          r={radius} 
          className={`${strokeClass} ${dropShadow}`} 
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none" 
          strokeDasharray={circumference} 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      
      {/* Center Text Area */}
      <div className="absolute flex flex-col items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
          className={`text-3xl font-extrabold ${colorClass} drop-shadow-md tracking-tighter`}
        >
          {normalizedScore}<span className="text-xl">%</span>
        </motion.span>
        <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5 font-bold">Risk</span>
      </div>
    </div>
  );
}
