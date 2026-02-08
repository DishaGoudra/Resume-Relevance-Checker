import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, AuthState, ATSReport, CandidateStatus } from './types';
import { db } from './services/database';
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import History from './components/History';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<ATSReport[]>([]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await db.init();
        const loadedUsers = await db.getUsers();
        const loadedReports = await db.getReports();
        const savedAuth = localStorage.getItem('auth');

        // Setup Prefixed Admin if database is empty
        const defaultAdmin: User = { 
          id: 'admin-001', 
          email: 'admin@atspro.com', 
          password: 'admin123', 
          name: 'Principal Recruiter', 
          role: 'admin' 
        };

        if (loadedUsers.length === 0) {
          await db.saveUser(defaultAdmin);
          setUsers([defaultAdmin]);
        } else {
          // Ensure our prefixed admin always exists for the demo
          if (!loadedUsers.find(u => u.email === defaultAdmin.email)) {
            await db.saveUser(defaultAdmin);
            setUsers([...loadedUsers, defaultAdmin]);
          } else {
            setUsers(loadedUsers);
          }
        }

        setReports(loadedReports);

        if (savedAuth) {
          const parsedAuth = JSON.parse(savedAuth);
          setAuth(parsedAuth);
        }

        setTimeout(() => setIsReady(true), 800);
      } catch (err) {
        console.error("Critical database error:", err);
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogin = (user: User) => {
    setAuth({ user, isAuthenticated: true });
  };

  const handleRegister = async (user: User) => {
    await db.saveUser(user);
    setUsers(prev => [...prev, user]);
    setAuth({ user, isAuthenticated: true });
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
  };

  const updateUser = async (updatedUser: User) => {
    await db.saveUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (auth.user?.id === updatedUser.id) {
      setAuth(prev => ({ ...prev, user: updatedUser }));
    }
  };

  const addReport = async (report: ATSReport) => {
    const reportWithStatus: ATSReport = { ...report, status: report.status || 'pending' };
    await db.saveReport(reportWithStatus);
    setReports(prev => [reportWithStatus, ...prev]);
  };

  const updateReportStatus = async (reportId: string, status: CandidateStatus) => {
    const reportToUpdate = reports.find(r => r.id === reportId);
    if (reportToUpdate) {
      const updated = { ...reportToUpdate, status };
      await db.updateReport(updated);
      setReports(prev => prev.map(r => r.id === reportId ? updated : r));
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8"></div>
        <h1 className="text-blue-500 font-black uppercase tracking-[0.5em] text-xs animate-pulse">Initializing Admin Gateway</h1>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className={`min-h-screen flex flex-col transition-colors duration-500 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <Navbar 
          auth={auth} 
          onLogout={handleLogout} 
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage auth={auth} darkMode={darkMode} />} />
            <Route 
              path="/login" 
              element={!auth.isAuthenticated ? <AuthForm type="login" users={users} onAuth={handleLogin} /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/register" 
              element={!auth.isAuthenticated ? <AuthForm type="register" users={users} onAuth={handleRegister} /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/dashboard" 
              element={auth.isAuthenticated ? (
                auth.user?.role === 'admin' ? (
                  <AdminDashboard reports={reports} onUpdateStatus={updateReportStatus} onUpdateUser={updateUser} user={auth.user!} darkMode={darkMode} />
                ) : (
                  <UserDashboard user={auth.user!} onReportAdded={addReport} onUpdateUser={updateUser} darkMode={darkMode} />
                )
              ) : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/history" 
              element={auth.isAuthenticated ? (
                <History reports={reports} userId={auth.user?.id} isAdmin={auth.user?.role === 'admin'} darkMode={darkMode} />
              ) : <Navigate to="/login" replace />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;