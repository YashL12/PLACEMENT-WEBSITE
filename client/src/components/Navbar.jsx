import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  BookOpen,
  Users,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Home,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Add scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Companies', path: '/companies', icon: Building2 },
    { label: 'Alumni', path: '/alumni', icon: Users },
    { label: 'Resources', path: '/learning-material', icon: BookOpen },
  ];

  return (
    <header
      className={`sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b transition-all duration-200 ${
        scrolled
          ? 'border-slate-200 shadow-sm'
          : 'border-slate-100'
      }`}
      style={{ backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none flex-shrink-0" aria-label="GECR Placement Sarthi — Home">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:border-blue-300 group-hover:shadow-md">
              <img
                src="/gecr-logo.png"
                alt="GECR Logo"
                className="w-full h-full object-contain p-0.5"
                loading="eager"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] sm:text-base font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
                GECR <span className="text-blue-600">Placement Sarthi</span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-slate-400 tracking-wide leading-none mt-0.5 truncate">
                GEC Rajkot · Computer Dept
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5" role="navigation" aria-label="Main navigation">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-100 ml-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  aria-label="Logout from admin"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 border border-slate-200"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
        className={`lg:hidden overflow-hidden transition-all duration-200 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  active ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-500'}`} />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 mt-1 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-1">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-900 bg-slate-100"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                  </div>
                  <span>Admin Dashboard</span>
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-rose-500" />
                  </div>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                </div>
                <span>Administrator Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
