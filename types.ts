
export type Role = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: Role;
}

export interface SkillMatch {
  name: string;
  status: 'matched' | 'missing';
}

export interface CategoryScore {
  subject: string;
  A: number;
  fullMark: number;
}

export type CandidateStatus = 'pending' | 'shortlisted' | 'rejected' | 'interviewing';

export interface ATSReport {
  id: string;
  userId: string;
  userName: string;
  jobTitle: string;
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  semanticAnalysis: string;
  improvementTips: string[];
  categoryScores: CategoryScore[];
  createdAt: string;
  resumeContent: string;
  jobDescription: string;
  status: CandidateStatus;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AnalysisResponse {
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  semanticAnalysis: string;
  improvementTips: string[];
  categoryScores: CategoryScore[];
}
