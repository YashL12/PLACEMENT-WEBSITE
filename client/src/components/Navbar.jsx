import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2, BookOpen, Users, ShieldCheck, Menu, X,
  LogOut, Home, Code2, Database, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home',       path: '/',                icon: Home },
  { label: 'Companies',  path: '/companies',       icon: Building2 },
  { label: 'Practice',   path: '/practice',        icon: Code2 },
  { label: 'Alumni',     path: '/alumni',          icon: Users },
  { label: 'Resources',  path: '/learning-material', icon: BookOpen },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`} role="banner">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="nav-brand" aria-label="GECRPlacement – Home">
          <div className="nav-brand-logo">
            <img src="/gecr-logo.png" alt="GECR" width="22" height="22" style={{ objectFit: 'contain' }} loading="eager" />
          </div>
          <span className="nav-brand-name">
            GECR<span>Placement</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-links" role="navigation" aria-label="Main navigation">
          {NAV_LINKS.map(({ label, path, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`nav-link${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right */}
        <div className="nav-right">
          {isAuthenticated ? (
            <>
              <Link
                to="/admin/dashboard"
                className={`nav-link${location.pathname.startsWith('/admin') ? ' active' : ''}`}
                aria-label="Admin dashboard"
              >
                <ShieldCheck style={{ width: 14, height: 14 }} />
                <span>Admin</span>
              </Link>
              <button
                onClick={logout}
                className="btn-icon"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut style={{ width: 15, height: 15 }} />
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="nav-admin-btn" aria-label="Admin login">
              <ShieldCheck style={{ width: 13, height: 13 }} />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-nav"
        className="nav-mobile"
        role="navigation"
        aria-label="Mobile navigation"
        style={{
          maxHeight: mobileOpen ? '480px' : '0',
          opacity: mobileOpen ? 1 : 0,
        }}
      >
        <div className="nav-mobile-inner">
          {NAV_LINKS.map(({ label, path, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`nav-mobile-link${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <div className="nav-mobile-icon">
                  <Icon style={{ width: 15, height: 15, color: active ? '#2563eb' : '#6b7280' }} />
                </div>
                <span>{label}</span>
              </Link>
            );
          })}

          <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
            {isAuthenticated ? (
              <>
                <Link to="/admin/dashboard" className="nav-mobile-link">
                  <div className="nav-mobile-icon">
                    <ShieldCheck style={{ width: 15, height: 15, color: '#6b7280' }} />
                  </div>
                  <span>Admin Dashboard</span>
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.6rem 0.75rem', borderRadius: '12px',
                    fontSize: '0.875rem', fontWeight: 500, color: '#ef4444',
                    background: 'none', border: 'none', cursor: 'pointer', width: '100%',
                  }}
                >
                  <div className="nav-mobile-icon" style={{ background: '#fef2f2' }}>
                    <LogOut style={{ width: 15, height: 15, color: '#ef4444' }} />
                  </div>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/admin/login" className="nav-mobile-link">
                <div className="nav-mobile-icon">
                  <ShieldCheck style={{ width: 15, height: 15, color: '#9ca3af' }} />
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
