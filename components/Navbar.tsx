import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthState } from '../types';

interface NavbarProps {
  auth: AuthState;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ auth, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  
  // State for the sliding indicator
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const isAdmin = auth.user?.role === 'admin';

  // Update sliding bar position when route changes
  useEffect(() => {
    const updateIndicator = () => {
      const activeElement = navRef.current?.querySelector('.active-link') as HTMLElement;
      if (activeElement) {
        setIndicatorStyle({
          left: activeElement.offsetLeft,
          width: activeElement.offsetWidth,
          opacity: 1
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    const timer = setTimeout(updateIndicator, 100);
    window.addEventListener('resize', updateIndicator);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [location.pathname, auth.isAuthenticated]);

  const getLinkClasses = (path: string, baseClasses: string = "") => {
    const isActive = location.pathname === path;
    return `${baseClasses} relative flex items-center gap-2 px-6 h-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 z-10 ${
      isActive 
        ? 'active-link text-blue-600 dark:text-blue-400' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
    }`;
  };

  const getAuthButtonClasses = (path: string) => {
    const isActive = location.pathname === path;
    const base = "relative px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 flex items-center gap-2 group/btn z-10";
    const activeClass = isActive ? "active-link " : "";
    return `${activeClass}${base} text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50`;
  };

  return (
    <nav className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-all h-20 shadow-xl shadow-blue-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div ref={navRef} className="relative flex justify-between h-full items-center">
          
          <div 
            className="absolute bottom-0 h-1 bg-blue-600 dark:bg-blue-500 transition-all duration-500 ease-out rounded-t-full shadow-[0_-4px_12px_rgba(37,99,235,0.3)] z-0"
            style={{ 
              left: `${indicatorStyle.left}px`, 
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity 
            }}
          />

          <div className="flex items-center gap-8 h-full">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                R
              </div>
              <span className="hidden sm:block text-base font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Resume Relevance<br/><span className="text-blue-600">Checker</span></span>
            </Link>

            <div className="hidden md:flex items-center h-full">
              <Link to="/" className={getLinkClasses('/')}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>

              {auth.isAuthenticated && (
                <>
                  <Link to="/dashboard" className={getLinkClasses('/dashboard')}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {isAdmin ? 'Admin Board' : 'Checker'}
                  </Link>
                  <Link to="/history" className={getLinkClasses('/history')}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 h-full">
            {auth.isAuthenticated ? (
              <div className="flex items-center gap-5 pl-5 border-l border-slate-200 dark:border-slate-800 h-full">
                <div className="hidden lg:block text-right">
                  {isAdmin ? (
                    <span className="inline-block px-2 py-0.5 bg-red-600 text-white text-[8px] font-black rounded uppercase tracking-widest mb-1">System Admin</span>
                  ) : (
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged in as</p>
                  )}
                  <p className="text-sm font-black text-slate-900 dark:text-slate-100">{auth.user?.name}</p>
                </div>
                <button 
                  onClick={handleLogoutClick}
                  className="px-6 py-3 text-xs font-black text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-2xl hover:bg-slate-800 dark:hover:bg-white transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 h-full">
                <Link to="/login" className={getAuthButtonClasses('/login')}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
                <Link to="/register" className={getAuthButtonClasses('/register')}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;