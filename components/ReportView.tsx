
import React from 'react';
import { ATSReport, CandidateStatus } from '../types';
import { 
  ResponsiveContainer, 
  RadialBarChart, 
  RadialBar, 
  PolarAngleAxis,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarRadiusAxis 
} from 'recharts';

interface ReportViewProps {
  report: ATSReport;
  darkMode: boolean;
}

const ReportView: React.FC<ReportViewProps> = ({ report, darkMode }) => {
  const radialData = [{ name: 'Score', value: report.overallScore, fill: report.overallScore > 70 ? '#16a34a' : (report.overallScore > 40 ? '#ca8a04' : '#dc2626') }];

  const getStatusDisplay = (status: CandidateStatus) => {
    switch(status) {
      case 'shortlisted': return { text: 'Shortlisted for Next Stage', color: 'bg-emerald-500 text-white', icon: '✅' };
      case 'rejected': return { text: 'Application Unsuccessful', color: 'bg-rose-500 text-white', icon: '❌' };
      case 'interviewing': return { text: 'Interview in Progress', color: 'bg-blue-500 text-white', icon: '💬' };
      default: return { text: 'Application Pending Review', color: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200', icon: '⏳' };
    }
  };

  const statusInfo = getStatusDisplay(report.status || 'pending');

  const handleDownload = () => {
    const reportContent = `
ATS PRO - RESUME RELEVANCE REPORT
----------------------------------
Job Title: ${report.jobTitle}
Score: ${report.overallScore}/100
Status: ${report.status?.toUpperCase() || 'PENDING'}
Date: ${new Date(report.createdAt).toLocaleDateString()}

MATCHED SKILLS:
${report.matchedSkills.join(', ')}

MISSING SKILLS:
${report.missingSkills.join(', ')}

SEMANTIC ANALYSIS:
${report.semanticAnalysis}

IMPROVEMENT TIPS:
${report.improvementTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}
    `;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATS_Report_${report.jobTitle.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Application Status Banner */}
      <div className={`w-full p-5 rounded-2xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-4 duration-500 ${statusInfo.color}`}>
        <div className="flex items-center gap-4">
           <span className="text-2xl">{statusInfo.icon}</span>
           <div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Application Status</p>
             <h3 className="text-lg font-black uppercase tracking-tight">{statusInfo.text}</h3>
           </div>
        </div>
        <div className="hidden md:block">
           <span className="px-3 py-1 bg-black/10 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">System ID: {report.id}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row items-center gap-12">
        <div className="w-56 h-56 relative flex-shrink-0">
           <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              innerRadius="80%" 
              outerRadius="100%" 
              barSize={12} 
              data={radialData} 
              startAngle={90} 
              endAngle={450}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar 
                background={{ fill: darkMode ? '#1e293b' : '#f1f5f9' }} 
                dataKey="value" 
                cornerRadius={30} 
                fill={radialData[0].fill} 
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-slate-900 dark:text-white">{report.overallScore}</span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Score</span>
          </div>
        </div>

        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Job Relevance Profile</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg italic">"{report.jobTitle}"</p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <button 
              onClick={handleDownload}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
             <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400 text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
             </span>
             Competency Radar
           </h3>
           <div className="h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={report.categoryScores}>
                 <PolarGrid stroke={darkMode ? "#334155" : "#e2e8f0"} />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 700 }} />
                 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                 <Radar
                   name="Score"
                   dataKey="A"
                   stroke="#3b82f6"
                   fill="#3b82f6"
                   fillOpacity={0.6}
                 />
               </RadarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded text-green-600 dark:text-green-400 text-sm">✓</span>
              Top Skill Matches
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.matchedSkills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-bold rounded-full border border-green-100 dark:border-green-800">
                  {skill}
                </span>
              ))}
              {report.matchedSkills.length === 0 && <p className="text-slate-400 text-sm italic">No significant matches.</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded text-red-600 dark:text-red-400 text-sm">!</span>
              Identified Skill Gaps
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.missingSkills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-bold rounded-full border border-red-100 dark:border-red-800">
                  {skill}
                </span>
              ))}
               {report.missingSkills.length === 0 && <p className="text-slate-400 text-sm italic">You have a flawless match!</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Semantic Match Reasoning</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{report.semanticAnalysis}</p>
      </div>

      <div className="bg-blue-600 dark:bg-blue-700 p-8 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Actionable Improvements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.improvementTips.map((tip, i) => (
            <div key={i} className="flex gap-4 bg-white/10 backdrop-blur p-4 rounded-xl border border-white/10">
              <span className="flex-shrink-0 w-8 h-8 bg-white text-blue-600 rounded-lg flex items-center justify-center font-black">
                {i + 1}
              </span>
              <p className="text-white font-medium">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportView;
