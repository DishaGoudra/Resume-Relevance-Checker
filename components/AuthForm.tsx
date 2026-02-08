import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface AuthFormProps {
  type: 'login' | 'register';
  users: User[];
  onAuth: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, users, onAuth }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isAdminRequest = queryParams.get('role') === 'admin';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (pass: string) => pass.length >= 6;

  const handleQuickAdminLogin = () => {
    const adminEmail = 'admin@atspro.com';
    const adminPass = 'admin123';
    
    // Auto-fill
    setFormData({ ...formData, email: adminEmail, password: adminPass });
    
    // Find and auth
    const adminUser = users.find(u => u.email === adminEmail && u.password === adminPass);
    if (adminUser) {
      setIsSuccess(true);
      setTimeout(() => onAuth(adminUser), 600);
    } else {
      setError('Admin account not found in database registry.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Specific check for leading number as requested
    if (/^\d/.test(formData.email)) {
      setError('INVALID EMAIL: Email ID should not start with a number.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('INVALID ENTRY: Please provide a standard email format.');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('SECURITY REQUIREMENT: Password must be at least 6 characters.');
      return;
    }

    if (type === 'register' && !formData.name.trim()) {
      setError('PROFILE INCOMPLETE: Name is required for registration.');
      return;
    }

    try {
      if (type === 'login') {
        const user = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.password === formData.password);
        if (user) {
          setIsSuccess(true);
          setTimeout(() => onAuth(user), 800);
        } else {
          setError('CREDENTIAL MISMATCH: The provided information is incorrect.');
        }
      } else {
        if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
          setError('IDENTITY CONFLICT: This email address is already registered.');
          return;
        }
        
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: isAdminRequest ? 'admin' : 'user'
        };

        setIsSuccess(true);
        setTimeout(() => onAuth(newUser), 1200);
      }
    } catch (err) {
      setError('SYSTEM ERROR: Unable to synchronize with authentication node.');
      setIsSuccess(false);
    }
  };

  const inputClasses = "block w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-5 text-slate-900 dark:text-white shadow-sm focus:border-blue-600 dark:focus:border-blue-500 transition-all outline-none placeholder:text-slate-500 font-medium text-lg";
  const labelClasses = "block text-[11px] font-black leading-6 text-slate-500 dark:text-slate-500 mb-3 uppercase tracking-[0.3em]";

  if (isSuccess) {
    return (
      <div className="flex min-h-[80vh] flex-col justify-center items-center px-6 py-12 animate-in fade-in duration-700 bg-slate-950">
        <div className="w-24 h-24 bg-blue-600/20 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse border border-blue-500/30">
           <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
           </svg>
        </div>
        <h2 className="text-4xl font-black text-white mb-3 uppercase tracking-tighter">Authorized Access</h2>
        <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs">Entering Recruitment Command Center</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col justify-center px-6 py-12 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-10 text-center text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
          {type === 'login' ? 'ADMIN LOGIN' : 'REGISTER'}
        </h2>
        <p className="mt-6 text-center text-[11px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.4em]">
          {type === 'login' ? 'Authorized Personnel Gateway' : 'Privileged Platform Enrollment'}
        </p>
      </div>

      <div className="mt-14 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#0c1324] px-10 py-14 shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)] rounded-[3rem] border border-slate-200 dark:border-slate-800">
          
          {type === 'login' && (
            <button 
              onClick={handleQuickAdminLogin}
              className="w-full mb-10 py-5 px-6 bg-blue-600/10 border-2 border-dashed border-blue-600/50 rounded-2xl flex items-center justify-between group hover:bg-blue-600/20 transition-all active:scale-95"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Prefixed Access</p>
                <p className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase">Login as Admin</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </button>
          )}

          <form className="space-y-10" onSubmit={handleSubmit}>
            {type === 'register' && (
              <div>
                <label className={labelClasses}>Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className={inputClasses}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className={labelClasses}>Email ID</label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                className={inputClasses}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClasses}>Security Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className={inputClasses}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="p-5 bg-rose-500/10 border-l-4 border-rose-500 rounded-2xl">
                <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-2xl px-4 py-6 text-sm font-black leading-6 text-white bg-blue-600 shadow-[0_15px_40px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all transform active:scale-95 uppercase tracking-[0.3em]"
              >
                {type === 'login' ? 'Validate Credentials' : 'Request Access'}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center border-t border-slate-100 dark:border-slate-800 pt-8">
            <p className="text-slate-400 dark:text-slate-500 font-bold text-xs tracking-widest uppercase">
              {type === 'login' ? "Need recruiter access?" : "Already a platform admin?"}
            </p>
            <Link 
              to={type === 'login' ? '/register?role=admin' : '/login?role=admin'} 
              className="mt-4 inline-block font-black text-blue-600 dark:text-blue-500 hover:text-blue-400 transition-colors uppercase text-xs tracking-[0.2em] border-b border-blue-500/30 pb-1"
            >
              {type === 'login' ? 'Register New Admin Account' : 'Return to Login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;