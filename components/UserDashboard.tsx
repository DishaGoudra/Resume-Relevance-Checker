import React, { useState } from 'react';
import { User, ATSReport } from '../types';
import { analyzeResume } from '../services/geminiService';
import ReportView from './ReportView';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker using the version from index.html importmap
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@5.4.530/build/pdf.worker.mjs`;

interface UserDashboardProps {
  user: User;
  onReportAdded: (report: ATSReport) => void;
  onUpdateUser: (updatedUser: User) => void;
  darkMode: boolean;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onReportAdded, onUpdateUser, darkMode }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [currentReport, setCurrentReport] = useState<ATSReport | null>(null);
  const [fileError, setFileError] = useState('');
  const [activeView, setActiveView] = useState<'checker' | 'profile'>('checker');

  const [profileData, setProfileData] = useState({ name: user.name, email: user.email });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB Limit
  const MAX_RESUME_CHARS = 20000; 

  const extractTextFromFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      if (extension === 'txt') {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }

      if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      }

      if (extension === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);
        
        const loadingTask = pdfjsLib.getDocument({
          data: typedArray,
          useWorkerFetch: true,
          isEvalSupported: false,
        });

        const pdf = await loadingTask.promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str || '')
              .join(' ');
            fullText += pageText + '\n';
          } catch (pageErr) {
            console.warn(`[Parser] Skipping page ${i}`);
          }
        }
        return fullText;
      }
    } catch (error: any) {
      console.error("[Parser Error]:", error);
      throw new Error(`FILE ERROR: Could not process this ${extension?.toUpperCase()} file.`);
    }

    throw new Error('UNSUPPORTED FORMAT: Please use PDF, DOCX, or TXT.');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`REJECTED: ${file.name} is too large. Limit is 5MB.`);
      setResumeText('');
      e.target.value = '';
      return;
    }
    
    setFileError('');
    setIsParsing(true);

    try {
      const extractedText = await extractTextFromFile(file);
      
      if (!extractedText || !extractedText.trim()) {
        throw new Error('EMPTY DOCUMENT: No text content found.');
      }
      
      setResumeText(extractedText);
    } catch (err: any) {
      setFileError(err.message || 'PROCESS FAILED: Try pasting the text manually.');
      setResumeText('');
    } finally {
      setIsParsing(false);
      e.target.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      alert('Provide both your resume and the job description for analysis.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeResume(resumeText, jobDescription);
      const newReport: ATSReport = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.name,
        jobTitle: jobDescription.split('\n')[0].substring(0, 50).trim() || "Resume Diagnostic",
        createdAt: new Date().toISOString(),
        resumeContent: resumeText,
        jobDescription: jobDescription,
        status: 'pending',
        ...analysis
      };
      
      await onReportAdded(newReport);
      
      // Visual transition to report
      setTimeout(() => {
        setCurrentReport(newReport);
        setIsAnalyzing(false);
      }, 300);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert('AI Engine error. Ensure your API key is valid and try again.');
      setIsAnalyzing(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    // Enforce leading number restriction in profile settings
    if (/^\d/.test(profileData.email)) {
      setProfileError('INVALID EMAIL: Email ID should not start with a number.');
      return;
    }

    onUpdateUser({ ...user, name: profileData.name, email: profileData.email });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  if (currentReport) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in duration-700">
        <div className="mb-6">
          <button 
            onClick={() => setCurrentReport(null)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-black flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> New Analysis
          </button>
        </div>
        <ReportView report={currentReport} darkMode={darkMode} />
      </div>
    );
  }

  const inputClasses = "w-full p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 transition-all outline-none shadow-sm placeholder:text-slate-400 font-medium";
  const labelClasses = "block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-[0.2em]";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveView('checker')}
          className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
            activeView === 'checker' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Diagnostic Engine
        </button>
        <button 
          onClick={() => setActiveView('profile')}
          className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
            activeView === 'profile' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Profile Settings
        </button>
      </div>

      <div className="bg-white dark:bg-[#0c1324] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {activeView === 'checker' ? (
          <>
            <div className="p-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Job Relevance Analysis</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold text-sm uppercase tracking-widest">Compare your profile against target roles.</p>
            </div>

            <div className="p-10 space-y-10">
              <div>
                <label className="block text-sm font-black text-slate-900 dark:text-white mb-3 uppercase tracking-widest">Target Job Description</label>
                <textarea
                  className={`${inputClasses} h-48 resize-none`}
                  placeholder="Paste the job requirements here..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Resume Content</label>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${resumeText.length > MAX_RESUME_CHARS ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}>
                    {resumeText.length.toLocaleString()} Characters Extracted
                  </span>
                </div>
                
                <div className="space-y-6">
                  <label className={`flex flex-col items-center justify-center w-full h-44 border-2 ${fileError ? 'border-rose-500 bg-rose-500/5' : 'border-slate-200 dark:border-slate-800'} border-dashed rounded-[2rem] cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group relative overflow-hidden ${isParsing ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      {isParsing ? (
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-xs text-blue-600 font-black uppercase tracking-widest">Extracting Metadata...</p>
                        </div>
                      ) : (
                        <>
                          <svg className={`w-12 h-12 mb-4 ${fileError ? 'text-rose-500' : 'text-blue-500'} group-hover:scale-110 transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-slate-800 dark:text-slate-200 font-black uppercase tracking-tight">Upload PDF, DOCX, or TXT</p>
                          <p className="text-[10px] text-slate-500 uppercase mt-2 tracking-[0.2em]">Below 5MB Maximum</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept=".txt,.pdf,.docx" onChange={handleFileChange} disabled={isParsing} />
                  </label>

                  {fileError && (
                    <div className="p-4 bg-rose-500/10 border-l-4 border-rose-500 rounded-xl">
                      <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">{fileError}</p>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute top-4 right-4 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full z-10 shadow-sm border border-slate-200 dark:border-slate-700">
                      Raw Profile Text
                    </div>
                    <textarea
                      className={`${inputClasses} h-64 font-mono text-xs pt-12 leading-relaxed resize-none scrollbar-thin`}
                      placeholder="Upload a file above or paste your resume text here..."
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || isParsing || !resumeText.trim() || !jobDescription.trim()}
                className={`w-full py-7 rounded-[1.5rem] font-black text-xl text-white shadow-2xl transition-all uppercase tracking-[0.2em] ${
                  (isAnalyzing || isParsing || !resumeText.trim() || !jobDescription.trim()) 
                  ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-50' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30 hover:-translate-y-1 active:scale-95'
                }`}
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Synthesizing Report...
                  </span>
                ) : isParsing ? 'Reading Profile...' : 'Analyze Resume'}
              </button>
            </div>
          </>
        ) : (
          <div className="p-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Identity Management</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={labelClasses}>Name</label>
                  <input
                    type="text"
                    className={inputClasses}
                    value={profileData.name}
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Primary Contact Email</label>
                  <input
                    type="email"
                    className={inputClasses}
                    value={profileData.email}
                    onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
              </div>

              {profileError && (
                <div className="p-4 bg-rose-500/10 border-l-4 border-rose-500 rounded-xl text-rose-500 font-black text-[10px] uppercase tracking-widest">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-xl text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                  Identity profiles updated successfully.
                </div>
              )}

              <div className="pt-4">
                <button type="submit" className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:-translate-y-1 transition-all">
                  Confirm Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;