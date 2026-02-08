import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthState } from '../types';

interface LandingPageProps {
  auth?: AuthState;
  darkMode?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ auth, darkMode }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-500">
      <style>{`
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: subtle-float 6s ease-in-out infinite;
        }
        .bg-grid {
          background-image: radial-gradient(${darkMode ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.05)'} 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .glass-panel {
          background: ${darkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)'};
          backdrop-filter: blur(12px);
          border: 1px solid ${darkMode ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.05)'};
        }
      `}</style>

      {/* Background Layer */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none"></div>

      <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 py-12 lg:py-20 max-w-7xl mx-auto w-full">
        
        {/* Main Hero Header */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.85]">
            RESUME<br />
            RELEVANCE <span className="text-blue-600">CHECKER</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Uncover semantic alignment gaps and optimize for industrial ATS ranking. Transform your profile into a high-impact professional asset.
          </p>
        </div>

        {/* Visual Showcase */}
        <div className="w-full max-w-5xl mb-20 animate-float relative group">
          <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-600/10 blur-[120px] -z-10 rounded-full scale-110"></div>
          
          <div className="w-full aspect-[16/9] bg-slate-50 dark:bg-[#020c24] rounded-[3rem] shadow-2xl border-4 border-white dark:border-slate-800 flex flex-col lg:flex-row items-center justify-around p-8 lg:p-16 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent"></div>
            
            <div className="z-10 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter text-blue-600 dark:text-blue-400 uppercase leading-none">
                PRECISION<br />
                <span className="text-slate-900 dark:text-white">MATCHING</span>
              </h2>
              <div className="mt-8 flex gap-3 justify-center lg:justify-start">
                 <div className="w-12 h-1.5 bg-blue-600 rounded-full"></div>
                 <div className="w-6 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
              </div>
            </div>

            <div className="relative w-full max-w-sm mt-12 lg:mt-0">
              <svg viewBox="0 0 400 300" className="w-full h-auto drop-shadow-[0_20px_50px_rgba(37,99,235,0.2)]">
                <rect x="50" y="20" width="300" height="220" rx="24" stroke={darkMode ? "#38bdf8" : "#2563eb"} strokeWidth="4" fill={darkMode ? "#01091a" : "#ffffff"}/>
                <rect x="80" y="50" width="240" height="10" rx="5" fill={darkMode ? "#1e293b" : "#f1f5f9"} />
                <rect x="80" y="75" width="180" height="10" rx="5" fill={darkMode ? "#1e293b" : "#f1f5f9"} />
                <rect x="80" y="120" width="240" height="80" rx="16" fill={darkMode ? "rgba(37,99,235,0.1)" : "#eff6ff"} stroke={darkMode ? "#38bdf8" : "#2563eb"} strokeWidth="2" strokeDasharray="8 4" />
                <circle cx="200" cy="160" r="25" fill={darkMode ? "#38bdf8" : "#2563eb"} className="animate-pulse" />
                <path d="M190 160L197 167L215 148" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col items-center gap-12 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link
              to={auth?.isAuthenticated ? "/dashboard" : "/register"}
              className="px-14 py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[1.5rem] shadow-2xl dark:shadow-[0_20px_60px_rgba(37,99,235,0.4)] transition-all transform hover:-translate-y-2 active:scale-95 text-xl uppercase tracking-[0.2em]"
            >
              Analyze Resume
            </Link>
            {!auth?.isAuthenticated && (
              <Link
                to="/login"
                className="px-12 py-6 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white font-black transition-all uppercase tracking-[0.2em] border-2 border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 rounded-[1.5rem] glass-panel"
              >
                Sign In
              </Link>
            )}
          </div>
          
          <div className="mt-12 pt-12 border-t border-slate-200 dark:border-slate-800 w-full max-w-lg text-center">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-[0.4em] mb-6">Recruitment Infrastructure</p>
            <Link 
              to="/login?role=admin" 
              className="inline-flex items-center gap-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-black uppercase text-sm tracking-[0.3em] group transition-all"
            >
              <span>Recruiter / Admin Portal</span>
              <div className="w-10 h-10 rounded-full border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 dark:bg-blue-600/5 rounded-full blur-[150px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/5 dark:bg-indigo-900/10 rounded-full blur-[150px] -z-10 -translate-x-1/2 translate-y-1/2"></div>
    </div>
  );
};

export default LandingPage;