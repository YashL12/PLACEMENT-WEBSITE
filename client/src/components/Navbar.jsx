import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Companies', path: '/companies', icon: Building2 },
    { label: 'Learning Material', path: '/learning-material', icon: BookOpen },
    { label: 'Alumni Directory', path: '/alumni', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Official GECR Logo & Brand Title */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-xl p-1 bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center flex-shrink-0 group-hover:border-blue-400 transition-colors">
              <img
                src="/gecr-logo.png"
                alt="GECR Official Logo"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
                GECR <span className="text-blue-700">Placement Sarthi</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 tracking-normal">
                Government Engineering College, Rajkot
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                    active
                      ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-100 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Admin link */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-slate-200">
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1 border border-slate-200/80"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-lg">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-1">
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-900 bg-slate-100"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Administrator Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
