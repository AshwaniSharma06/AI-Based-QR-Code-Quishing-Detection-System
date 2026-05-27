import React, { useState, useEffect } from 'react';
import { Shield, ScanLine, Upload, Camera, Menu, X, ChevronRight, Lock, ArrowLeft, Activity, Globe, CheckCircle, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraScanner from './components/CameraScanner';
import UploadQR from './components/UploadQR';
import AILoadingScreen from './components/AILoadingScreen';
import ResultDashboard from './components/ResultDashboard';
import Footer from './components/Footer';

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('hero'); // 'hero', 'upload', 'camera', 'result'
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('qrshield_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('qrshield_history', JSON.stringify(scanHistory));
  }, [scanHistory]);

  const addToHistory = (result) => {
    const entry = {
      id: Date.now(),
      url: result.url,
      isSafe: result.isSafe,
      riskScore: result.riskScore,
      threatLevel: result.threatLevel,
      timestamp: new Date().toLocaleString(),
    };
    setScanHistory(prev => [entry, ...prev].slice(0, 20)); // keep last 20
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('qrshield_history');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProcess = async (extractedUrl) => {
    if (typeof extractedUrl !== 'string' || !extractedUrl) {
        console.error("Invalid URL passed to handleProcess", extractedUrl);
        extractedUrl = "http://example.com/suspicious-link";
    }

    setIsProcessing(true);
    
    try {
      // Ensure the AI loading screen shows for at least a few seconds for UX
      const startTime = Date.now();
      
      const response = await fetch('http://127.0.0.1:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: extractedUrl }),
      });
      
      const data = await response.json();
      
      const elapsed = Date.now() - startTime;
      if (elapsed < 4000) {
        await new Promise(resolve => setTimeout(resolve, 4000 - elapsed));
      }
      
      setIsProcessing(false);
      
      if (data.success && data.analysis) {
        const resultObj = {
          isSafe: data.analysis.status === "Safe",
          url: data.url,
          riskScore: data.analysis.risk_score,
          threatLevel: data.analysis.risk_level.toUpperCase(),
          summary: data.analysis.status === "Safe" 
            ? "This QR code points to a safe domain with no suspicious indicators."
            : "Suspicious indicators found. Proceed with caution.",
          warnings: data.analysis.reasons || []
        };
        setScanResult(resultObj);
        addToHistory(resultObj);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
      
    } catch (error) {
      console.error("Error communicating with backend:", error);
      setIsProcessing(false);
      const errorResult = {
        isSafe: false,
        url: extractedUrl,
        riskScore: 50,
        threatLevel: "UNKNOWN",
        summary: "Could not connect to AI analysis server. Please try again later.",
        warnings: ["Backend connection failed."]
      };
      setScanResult(errorResult);
      addToHistory(errorResult);
    }
    
    setActiveTab('result');
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-gray-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      {/* Sticky Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#050B14]/80 backdrop-blur-md border-b border-cyan-500/20 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setActiveTab('hero')}
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/30 group-hover:border-cyan-400 transition-colors">
                <Shield className="w-5 h-5 text-cyan-400" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">
                QRShield <span className="text-cyan-400">AI</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" onClick={(e) => { e.preventDefault(); setActiveTab('hero'); }} className="text-sm font-medium hover:text-cyan-400 transition-colors">Home</a>
              <a href="#features" className="text-sm font-medium hover:text-cyan-400 transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium hover:text-cyan-400 transition-colors">About</a>
              <button 
                onClick={() => setActiveTab('camera')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 text-sm font-semibold hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300"
              >
                <ScanLine className="w-4 h-4" />
                <span>Scan QR</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 w-full bg-[#0A1128]/95 backdrop-blur-lg border-b border-cyan-500/20 py-4 px-6 md:hidden flex flex-col gap-4"
          >
            <a href="#home" onClick={() => { setActiveTab('hero'); setMobileMenuOpen(false); }} className="text-base font-medium text-white hover:text-cyan-400">Home</a>
            <a href="#features" className="text-base font-medium text-white hover:text-cyan-400">Features</a>
            <a href="#about" className="text-base font-medium text-white hover:text-cyan-400">About</a>
            <button 
              onClick={() => { setActiveTab('camera'); setMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 mt-2 rounded-lg bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-semibold"
            >
              <ScanLine className="w-5 h-5" />
              <span>Scan QR</span>
            </button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 min-h-screen flex items-center z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-8 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium uppercase tracking-wider w-fit mx-auto lg:mx-0">
              <Lock className="w-3 h-3" />
              <span>Next-Gen QR Security</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
              AI-Powered <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                Threat Detection
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Protect yourself from sophisticated QR phishing attacks (Quishing). Our advanced AI analyzes QR codes in real-time to detect malicious links and hidden threats before you scan.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => setActiveTab('upload')}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:scale-105 transition-all duration-300"
              >
                <Upload className="w-5 h-5" />
                <span>Upload QR Image</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('camera')}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 group"
              >
                <Camera className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                <span>Scan with Camera</span>
              </button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span>Zero-day Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                <span>Instant Analysis</span>
              </div>
            </div>
          </motion.div>

          {/* Right Area - Dynamic based on activeTab */}
          <div className="relative lg:h-[600px] flex flex-col items-center justify-center w-full">
            {activeTab !== 'hero' && (
              <button 
                onClick={() => setActiveTab('hero')}
                className="absolute -top-12 lg:top-0 left-0 lg:-left-8 flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-colors z-20"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            )}

            {activeTab === 'hero' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                
                <div className="relative w-full max-w-lg aspect-square">
                  {/* Outer rotating rings */}
                  <div className="absolute inset-4 border border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-8 border border-blue-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                  
                  {/* Main Illustration Image */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.15)] bg-[#0A1128]/50 backdrop-blur-sm group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 shadow-[0_0_10px_#22d3ee] animate-[bounce_3s_infinite]" />
                      <img 
                        src="/hero-illustration.png" 
                        alt="AI QR Code Threat Detection Illustration" 
                        className="w-full h-full object-cover mix-blend-screen opacity-90 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent" />
                      
                      {/* Scanning line effect */}
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-[scan_3s_ease-in-out_infinite]" style={{
                        boxShadow: '0 0 10px 2px rgba(34, 211, 238, 0.5), 0 0 20px 5px rgba(34, 211, 238, 0.3)'
                      }} />
                      <style>{`
                        @keyframes scan {
                          0%, 100% { top: 10%; opacity: 0; }
                          10%, 90% { opacity: 1; }
                          50% { top: 90%; }
                        }
                      `}</style>
                    </div>
                  </div>
                </div>
                
                {/* Floating badges */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/4 -left-4 bg-[#0A1128]/80 backdrop-blur-md border border-green-500/30 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Status</p>
                    <p className="text-sm font-bold text-white">Safe to Scan</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-1/4 -right-4 bg-[#0A1128]/80 backdrop-blur-md border border-cyan-500/30 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <ScanLine className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">AI Analysis</p>
                    <p className="text-sm font-bold text-white">Threats: 0</p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'upload' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full flex flex-col items-center"
              >
                <div className="w-full mb-8 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Upload QR Code</h2>
                  <p className="text-gray-400">Select an image to analyze its contents securely.</p>
                </div>
                <UploadQR onUpload={handleProcess} />
              </motion.div>
            )}

            {activeTab === 'camera' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full flex flex-col items-center"
              >
                <div className="w-full mb-8 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Live Camera Scan</h2>
                  <p className="text-gray-400">Point your camera at a QR code to detect threats.</p>
                </div>
                <CameraScanner onScan={handleProcess} />
              </motion.div>
            )}

            {activeTab === 'result' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col items-center pt-8 lg:pt-0"
              >
                <ResultDashboard 
                  result={scanResult} 
                  onClose={() => setActiveTab('hero')} 
                />
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#050B14] relative z-10 border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Advanced Threat Intelligence</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our system uses multi-layered analysis to detect and block malicious QR codes before they compromise your device.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <ScanLine />, title: "Real-time AI Vision", desc: "Instantly extracts and analyzes QR patterns and obfuscated URLs." },
              { icon: <Shield />, title: "Zero-Day Protection", desc: "Identifies never-before-seen phishing domains using predictive AI." },
              { icon: <Lock />, title: "Privacy First", desc: "Your images and scans are analyzed locally or encrypted end-to-end." },
              { icon: <Activity />, title: "Behavioral Analysis", desc: "Tracks hidden redirects and malicious iframe injections." },
              { icon: <Globe />, title: "Global Threat DB", desc: "Cross-references URLs against millions of known phishing signatures." },
              { icon: <CheckCircle />, title: "Safe Browsing", desc: "Provides a secure sandbox environment to preview suspicious links." }
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#0A1128]/50 border border-cyan-500/10 hover:border-cyan-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-[#0A1128] relative z-10 border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 relative h-96 rounded-2xl overflow-hidden border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 mix-blend-overlay z-10" />
            <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop" alt="Cyber Security" className="w-full h-full object-cover" />
          </div>
          
          <div className="order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium uppercase tracking-wider">
              <AlertTriangle className="w-3 h-3" />
              <span>The Quishing Threat</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Why QRShield?</h2>
            <p className="text-gray-400 leading-relaxed text-lg">
              QR codes are inherently unreadable by humans, making them the perfect vehicle for attackers to hide malicious URLs. This technique, known as <strong>"Quishing"</strong>, bypasses traditional email filters and directly targets your mobile device.
            </p>
            <p className="text-gray-400 leading-relaxed">
              QRShield acts as a protective layer between the physical world and your device. By scanning codes through our platform first, you ensure that every destination is verified by enterprise-grade threat intelligence before your browser ever makes a connection.
            </p>
          </div>
        </div>
      </section>

      {/* Scan History Section */}
      {scanHistory.length > 0 && (
        <section id="history" className="py-24 bg-[#050B14] relative z-10 border-t border-cyan-500/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">Recent Scans</h2>
                <p className="text-gray-400">Your scan history is stored locally on this device.</p>
              </div>
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear History</span>
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {scanHistory.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      entry.isSafe
                        ? 'bg-green-500/5 border-green-500/15 hover:border-green-500/30'
                        : 'bg-red-500/5 border-red-500/15 hover:border-red-500/30'
                    }`}
                  >
                    {/* Status Indicator */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      entry.isSafe ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {entry.isSafe
                        ? <CheckCircle className="w-5 h-5 text-green-400" />
                        : <AlertTriangle className="w-5 h-5 text-red-400" />
                      }
                    </div>

                    {/* URL and details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{entry.url}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${
                          entry.isSafe ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {entry.threatLevel}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {entry.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Risk Score Badge */}
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-bold shrink-0 ${
                      entry.isSafe
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {entry.riskScore}%
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />

      {/* Render AI Loading Screen when processing */}
      {isProcessing && <AILoadingScreen />}
    </div>
  );
}
