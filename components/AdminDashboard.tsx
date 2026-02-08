import React, { useMemo, useState, useEffect } from 'react';
import { ATSReport, CandidateStatus, User } from '../types';
import { db } from '../services/database';
import ReportView from './ReportView';

interface AdminDashboardProps {
  reports: ATSReport[];
  onUpdateStatus?: (reportId: string, status: CandidateStatus) => void;
  onUpdateUser?: (updatedUser: User) => void;
  user: User;
  darkMode: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ reports, onUpdateStatus, onUpdateUser, user, darkMode }) => {
  const [selectedReport, setSelectedReport] = useState<ATSReport | null>(null);
  const [activeJobFilter, setActiveJobFilter] = useState<string>('all');
  const [activeView, setActiveView] = useState<'leaderboard' | 'database'>('leaderboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: user.name, email: user.email });
  const [dbStats, setDbStats] = useState({ users: 0, reports: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await db.getStats();
        setDbStats(stats);
      } catch (e) {
        console.error("Stats fetch error:", e);
      }
    };
    fetchStats();
  }, [activeView, reports]);

  const jobGroups = useMemo(() => {
    const groups: Record<string, ATSReport[]> = {};
    reports.forEach(report => {
      const title = report.jobTitle.trim() || "General Diagnostic";
      if (!groups[title]) groups[title] = [];
      groups[title].push(report);
    });
    return groups;
  }, [reports]);

  const uniqueJobTitles = useMemo(() => Object.keys(jobGroups), [jobGroups]);

  const displayedReports = useMemo(() => {
    let list = activeJobFilter === 'all' ? [...reports] : (jobGroups[activeJobFilter] || []);
    // CRITICAL RANKING: Sort by highest overallScore first
    return list.sort((a, b) => {
      if (b.overallScore !== a.overallScore) {
        return b.overallScore - a.overallScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reports, activeJobFilter, jobGroups]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser?.({ ...user, name: profileData.name, email: profileData.email });
    setIsEditingProfile(false);
  };

  const getStatusColor = (status: CandidateStatus) => {
    switch(status) {
      case 'shortlisted': return 'bg-emerald-500 text-white border-emerald-600';
      case 'rejected': return 'bg-rose-500 text-white border-rose-600';
      case 'interviewing': return 'bg-blue-500 text-white border-blue-600';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';
    }
  };

  if (selectedReport) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setSelectedReport(null)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-black flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform text-xl">←</span> 
            <span className="uppercase tracking-widest text-sm text-slate-900 dark:text-white">Back to Candidate Ranking</span>
          </button>
          
          <div className="flex gap-3">
             <button 
               onClick={() => { onUpdateStatus?.(selectedReport.id, 'shortlisted'); setSelectedReport(null); }}
               className="px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg bg-emerald-600 text-white hover:bg-emerald-700"
             >
               Shortlist
             </button>
             <button 
               onClick={() => { onUpdateStatus?.(selectedReport.id, 'rejected'); setSelectedReport(null); }}
               className="px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg bg-rose-600 text-white hover:bg-rose-700"
             >
               Reject
             </button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-200 dark:border-slate-800">
           <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Candidate Profile</p>
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{selectedReport.userName}</h2>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Applied for</p>
                 <p className="text-lg font-bold text-blue-600 uppercase tracking-tight">{selectedReport.jobTitle}</p>
              </div>
           </div>
           <ReportView report={selectedReport} darkMode={darkMode} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
             </div>
             <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
               RECRUITER <span className="text-blue-600">DASHBOARD</span>
             </h1>
          </div>
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveView('leaderboard')}
              className={`text-[11px] font-black uppercase tracking-widest pb-2 border-b-4 transition-all ${activeView === 'leaderboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Candidate Ranking Matrix
            </button>
            <button 
              onClick={() => setActiveView('database')}
              className={`text-[11px] font-black uppercase tracking-widest pb-2 border-b-4 transition-all ${activeView === 'database' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Strategic Insights
            </button>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all text-slate-900 dark:text-white"
          >
            Admin Profile
          </button>
          <div className="px-8 py-5 bg-slate-950 dark:bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/10 flex flex-col justify-center min-w-[200px]">
            <p className="text-[10px] font-black text-slate-400 dark:text-blue-100 uppercase tracking-[0.2em] mb-1">Global History</p>
            <p className="text-3xl font-black text-white leading-none">
              {reports.length} <span className="text-xs opacity-50">SCANS</span>
            </p>
          </div>
        </div>
      </div>

      {isEditingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-white dark:bg-[#0c1324] w-full max-w-md rounded-[3rem] p-12 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-slate-900 dark:text-white">Admin Management</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={e => setProfileData({...profileData, name: e.target.value})}
                  className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white outline-none focus:border-blue-600 transition-all text-lg font-bold"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-500">Save Identity</button>
                <button type="button" onClick={() => setIsEditingProfile(false)} className="px-8 py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-900 dark:text-white">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeView === 'leaderboard' ? (
        <div className="space-y-8">
          <div className="flex flex-wrap gap-3 items-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mr-2">Filter by Job Hub:</p>
            <button
              onClick={() => setActiveJobFilter('all')}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeJobFilter === 'all' 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              All Hubs
            </button>
            {uniqueJobTitles.map(title => (
              <button
                key={title}
                onClick={() => setActiveJobFilter(title)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                  activeJobFilter === title 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
                }`}
              >
                {title}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-[#0c1324] rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Rank</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Candidate Intelligence</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">ATS Performance</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Candidate Status</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Deep Diagnostic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedReports.map((report, index) => (
                    <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/5 transition-colors group">
                      <td className="px-10 py-10">
                        <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                          index === 0 ? 'bg-amber-400 text-white shadow-lg shadow-amber-500/20' :
                          index === 1 ? 'bg-slate-300 text-slate-700 shadow-lg shadow-slate-400/20' :
                          index === 2 ? 'bg-orange-400 text-white shadow-lg shadow-orange-500/20' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-10 py-10">
                        <div>
                          <p className="font-black uppercase text-xl text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{report.userName}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">{report.jobTitle}</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10">
                        <div className="flex items-center gap-4">
                           <span className={`text-3xl font-black tabular-nums ${report.overallScore > 75 ? 'text-emerald-500' : report.overallScore > 50 ? 'text-blue-500' : 'text-rose-500'}`}>
                             {report.overallScore}%
                           </span>
                           <div className="flex-grow max-w-[100px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-1000 ${report.overallScore > 75 ? 'bg-emerald-500' : report.overallScore > 50 ? 'bg-blue-500' : 'bg-rose-500'}`} style={{ width: `${report.overallScore}%` }}></div>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-10">
                        <div className="relative group/select inline-block min-w-[160px]">
                          <select 
                            value={report.status || 'pending'}
                            onChange={(e) => onUpdateStatus?.(report.id, e.target.value as CandidateStatus)}
                            className={`w-full appearance-none px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all cursor-pointer outline-none ${
                              report.status === 'shortlisted' ? 'bg-emerald-500/5 border-emerald-500 text-emerald-600' :
                              report.status === 'rejected' ? 'bg-rose-500/5 border-rose-500 text-rose-600' :
                              report.status === 'interviewing' ? 'bg-blue-500/5 border-blue-500 text-blue-600' :
                              'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                            }`}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="shortlisted">✅ Shortlist</option>
                            <option value="rejected">❌ Reject</option>
                            <option value="interviewing">💬 Interview</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-right">
                        <button 
                          onClick={() => setSelectedReport(report)} 
                          className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl inline-flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-90"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {displayedReports.length === 0 && (
              <div className="py-40 text-center">
                 <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                 </div>
                 <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Database Registry Empty</p>
                 <p className="text-sm font-bold text-slate-500 uppercase mt-2">No resumes have been analyzed in this category yet.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           <div className="bg-white dark:bg-[#0c1324] p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
             <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 text-slate-900 dark:text-white">Network Expansion</h3>
             <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-3">Total Candidates</span>
                <span className="text-5xl font-black text-blue-600 tabular-nums">{dbStats.users}</span>
             </div>
           </div>
           <div className="bg-white dark:bg-[#0c1324] p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
             <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 text-slate-900 dark:text-white">Intelligence Velocity</h3>
             <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-3">Total Scans Executed</span>
                <span className="text-5xl font-black text-emerald-500 tabular-nums">{dbStats.reports}</span>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;