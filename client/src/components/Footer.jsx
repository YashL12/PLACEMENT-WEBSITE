import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, BookOpen, Users, Shield, Home,
  Code2, Heart, ExternalLink, GraduationCap,
} from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Home',           path: '/',                icon: Home },
  { label: 'Company Directory', path: '/companies',   icon: Building2 },
  { label: 'Practice',       path: '/practice',        icon: Code2 },
  { label: 'Alumni Network', path: '/alumni',          icon: Users },
  { label: 'Resources',      path: '/learning-material', icon: BookOpen },
];

const WHATSAPP_URL = `https://wa.me/916351521549?text=${encodeURIComponent('Hi Yash, I have a question about GECRPlacement.')}`;

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}
          className="footer-grid">
          {/* Brand */}
          <div style={{ maxWidth: 380 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img src="/gecr-logo.png" alt="GECR" width="22" height="22" style={{ objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em' }}>
                  GECR<span style={{ color: '#60a5fa' }}>Placement</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 1 }}>
                  Government Engineering College, Rajkot
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: '#64748b', marginBottom: '1rem' }}>
              An independent student-focused platform for campus placement preparation.
              Not an official institute website.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 0.75rem', borderRadius: 8,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.75rem', color: '#64748b',
            }}>
              <GraduationCap style={{ width: 13, height: 13, color: '#60a5fa', flexShrink: 0 }} />
              <span>Independent initiative · Computer Dept, GECR</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569', marginBottom: '1rem' }}>
              Navigate
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {QUICK_LINKS.map(({ label, path, icon: Icon }) => (
                <li key={path}>
                  <Link to={path} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.875rem', color: '#64748b', transition: 'color 0.15s ease',
                    textDecoration: 'none',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                  >
                    <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/admin/login" style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.875rem', color: '#475569', transition: 'color 0.15s ease',
                  textDecoration: 'none',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >
                  <Shield style={{ width: 13, height: 13, flexShrink: 0 }} />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569', marginBottom: '1rem' }}>
              Contact & Support
            </h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: '#64748b', marginBottom: '1rem' }}>
              Questions, suggestions, or feedback? Feel free to reach out.
            </p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', borderRadius: 10,
                background: '#25d366', color: '#fff',
                fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1ea952'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#25d366'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Chat on WhatsApp</span>
              <ExternalLink style={{ width: 12, height: 12, opacity: 0.7 }} />
            </a>
          </div>
        </div>

        <style>{`
          @media (min-width: 768px) {
            .footer-grid {
              grid-template-columns: 2fr 1fr 1fr !important;
            }
          }
        `}</style>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: '2.5rem', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#475569' }}>
              © {year} GECRPlacement. Independent student initiative.
            </p>
            <p style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span>Built with</span>
              <Heart style={{ width: 12, height: 12, color: '#f87171', fill: '#f87171' }} />
              <span>by <strong style={{ color: '#94a3b8' }}>Yash Lakhani</strong></span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
