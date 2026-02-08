
import React, { useState } from 'react';
import { ATSReport } from '../types';
import ReportView from './ReportView';

interface HistoryProps {
  reports: ATSReport[];
  userId?: string;
  isAdmin?: boolean;
  darkMode: boolean;
}

const History: React.FC<HistoryProps> = ({ reports, userId, isAdmin, darkMode }) => {
  const [selectedReport, setSelectedReport] = useState<ATSReport | null>(null);

  // Filter reports by the specific Login ID (userId) unless the viewer is an Admin.
  const filteredReports = isAdmin 
    ? [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : reports.filter(r => r.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (selectedReport) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <button 
          onClick={() => setSelectedReport(null)}
          className="mb-8 text-blue-600 dark:text-blue-400 hover:underline font-black flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to {isAdmin ? 'Global' : 'Your'} History
        </button>
        <ReportView report={selectedReport} darkMode={darkMode} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
          {isAdmin ? 'System-Wide History' : 'Your Diagnostic History'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-sm mt-2 italic">
          {isAdmin ? 'Monitoring all candidate submissions and AI rankings.' : 'Revisit your career progression scans.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredReports.map(report => (
          <div 
            key={report.id}
            className="group bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => setSelectedReport(report)}
          >
            <div className="absolute top-0 right-0 p-4">
               <div className={`px-3 py-1 rounded-bl-2xl rounded-tr-lg text-[8px] font-black uppercase tracking-widest shadow-sm ${
                 report.status === 'shortlisted' ? 'bg-emerald-500 text-white' :
                 report.status === 'rejected' ? 'bg-rose-500 text-white' :
                 'bg-slate-500 text-white opacity-50'
               }`}>
                 {report.status || 'pending'}
               </div>
            </div>

            <div className="flex justify-between items-start mb-4">
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                report.overallScore > 75 ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' :
                report.overallScore > 50 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 
                'bg-red-500 text-white shadow-lg shadow-red-500/20'
              }`}>
                {report.overallScore}% Score
              </span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="mb-1">
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">
                Candidate: {report.userName}
              </p>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 uppercase tracking-tight h-14">
              {report.jobTitle}
            </h3>
            
            <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Report</p>
               <p className={`text-xs font-bold uppercase truncate ${
                 report.status === 'shortlisted' ? 'text-emerald-500' :
                 report.status === 'rejected' ? 'text-rose-500' : 'text-slate-500'
               }`}>
                 Decision: {report.status?.toUpperCase() || 'PENDING EVALUATION'}
               </p>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{report.matchedSkills.length} MATCHES</span>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-700">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest group-hover:underline">Detailed Profile</span>
              <svg className="w-5 h-5 text-blue-600 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="col-span-full py-40 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-700">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
               <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
            </div>
            <p className="text-xl font-black text-slate-400 uppercase tracking-widest">No diagnostics found</p>
            <p className="text-slate-500 font-bold mt-2 uppercase text-xs tracking-widest">
              {isAdmin ? 'No reports have been generated by users yet.' : 'Initiate a scan to populate your history.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
