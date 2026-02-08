import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#000a1a] border-t border-slate-200 dark:border-slate-800 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center items-center gap-3">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-500/20">R</div>
           <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Resume Relevance<span className="text-blue-600">Checker</span></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;