import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Building2, BookOpen, ArrowRight, ArrowUpRight,
  HelpCircle, GraduationCap, Users, Code2, Database,
  ChevronRight, Star, FileText, Shield,
} from 'lucide-react';
import { api } from '../services/api';
import { CompanyCard } from '../components/CompanyCard';
import { CompanyCardSkeleton } from '../components/CompanyCardSkeleton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { tracker } from '../services/tracker';

const PRIORITY_COMPANIES = ['Kevit', 'TSS', 'RKIT', 'TatvaSoft', 'eSparkBiz', 'Gateway', 'Prominent Pixel', 'GN Websoft'];

const FEATURES = [
  {
    icon: Code2,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    title: 'DSA & SQL Practice',
    desc: 'Curated collection of placement coding questions from real GECR recruiter drives. Solve directly on verified platforms.',
    href: '/practice',
    cta: 'Start Practicing',
    ctaColor: '#2563eb',
  },
  {
    icon: Building2,
    iconBg: '#f0f4ff',
    iconColor: '#4f46e5',
    title: 'Company Directory',
    desc: 'Priority-ordered recruiting companies across 2024, 2025, and Report – 2026 with complete interview timelines and criteria.',
    href: '/companies',
    cta: 'Browse Companies',
    ctaColor: '#4f46e5',
  },
  {
    icon: HelpCircle,
    iconBg: '#fdf4ff',
    iconColor: '#9333ea',
    title: 'Interview Questions',
    desc: '1,400+ real coding problems, technical MCQs, and HR questions reported by GECR Computer Dept students.',
    href: '/companies',
    cta: 'Explore Questions',
    ctaColor: '#9333ea',
  },
  {
    icon: BookOpen,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    title: 'Study Resources',
    desc: 'Curated DSA cheatsheets, OS & DBMS guides, aptitude prep sheets, and company-specific study materials.',
    href: '/learning-material',
    cta: 'View Resources',
    ctaColor: '#16a34a',
  },
];

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [stats, setStats] = useState({
    companiesCount: 26,
    experiencesCount: 76,
    questionsCount: 1426,
    codingQuestionsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [statsRes, compRes] = await Promise.all([
          api.getPublicStats().catch(() => ({ success: false })),
          api.getCompanies({ limit: 6 }).catch(() => ({ success: false })),
        ]);
        if (statsRes.success && statsRes.data) {
          setStats({
            companiesCount: statsRes.data.companiesCount || 26,
            experiencesCount: statsRes.data.experiencesCount || 76,
            questionsCount: statsRes.data.questionsCount || 1426,
            codingQuestionsCount: statsRes.data.codingQuestionsCount || 0,
          });
        }
        if (compRes.success && compRes.data?.companies) {
          setFeaturedCompanies(compRes.data.companies);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      tracker.trackSearch(query, 'companies');
      navigate(`/companies?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/companies');
    }
  };

  const STATS = [
    { value: stats.companiesCount,         label: 'Recruiting Companies',        icon: Building2, color: '#2563eb', bg: '#eff6ff' },
    { value: stats.experiencesCount,       label: 'Interview Experiences',        icon: FileText,  color: '#7c3aed', bg: '#f5f3ff' },
    { value: `${stats.questionsCount}+`,   label: 'Company Interview Questions',  icon: HelpCircle, color: '#0369a1', bg: '#f0f9ff' },
    { value: `${stats.codingQuestionsCount}+`, label: 'Practice Questions',       icon: Code2,     color: '#059669', bg: '#f0fdf4' },
  ];

  return (
    <div style={{ background: '#f9fafb' }}>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(165deg, #f0f6ff 0%, #f9fafb 55%, #fff 100%)',
          borderBottom: '1px solid #e5e7eb',
          padding: '3.5rem 0 3rem',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.3rem 0.875rem', borderRadius: 999,
              background: '#fff', border: '1px solid #bfdbfe',
              color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 700,
              marginBottom: '1.25rem', boxShadow: '0 1px 4px rgb(37 99 235 / 0.08)',
            }}>
              <GraduationCap style={{ width: 14, height: 14 }} />
              GEC Rajkot · Computer Engineering Dept
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '1rem',
            }}>
              Crack Your Campus Placement with{' '}
              <span style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Real Experiences
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
              color: '#475569',
              lineHeight: 1.7,
              marginBottom: '2rem',
              fontWeight: 400,
            }}>
              Authentic round-by-round interview questions, selection processes, and
              preparation resources from seniors across <strong>2024, 2025, and Report – 2026</strong>.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{
              display: 'flex', alignItems: 'center',
              background: '#fff', border: '2px solid #2563eb',
              borderRadius: 14, padding: '0.35rem 0.35rem 0.35rem 1rem',
              boxShadow: '0 4px 20px rgb(37 99 235 / 0.12)',
              marginBottom: '1.25rem',
            }}>
              <Search style={{ width: 18, height: 18, color: '#9ca3af', flexShrink: 0, marginRight: '0.625rem' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search companies — Kevit, TSS, RKIT, TatvaSoft..."
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: '0.9375rem', color: '#111827', background: 'transparent',
                }}
              />
              <button
                type="submit"
                className="btn btn-navy"
                style={{ padding: '0.65rem 1.25rem', borderRadius: 10, fontSize: '0.875rem' }}
              >
                Search
              </button>
            </form>

            {/* Priority Company Tags */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Frequent Recruiters:</span>
              {PRIORITY_COMPANIES.map(name => (
                <Link
                  key={name}
                  to={`/companies?search=${encodeURIComponent(name)}`}
                  style={{
                    padding: '0.2rem 0.6rem', borderRadius: 999,
                    background: '#fff', border: '1px solid #e2e8f0',
                    color: '#334155', fontSize: '0.75rem', fontWeight: 500,
                    textDecoration: 'none', transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1.75rem 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
          }} className="stats-grid">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: s.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon style={{ width: 20, height: 20, color: s.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                      {loading ? '—' : s.value}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginTop: 2 }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <style>{`
            @media (min-width: 640px) {
              .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
            }
          `}</style>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section style={{ padding: '3.5rem 0', background: '#f9fafb' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 2.5rem' }}>
            <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
              Everything You Need to Prepare
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
              Structured, verified content collected directly from GECR campus interview rounds.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.25rem' }} className="features-grid">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{
                  background: '#fff', border: '1px solid #e5e7eb',
                  borderRadius: 16, padding: '1.75rem',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = f.iconColor; e.currentTarget.style.boxShadow = `0 8px 24px ${f.iconColor}14`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: f.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.125rem' }}>
                      <Icon style={{ width: 22, height: 22, color: f.iconColor }} />
                    </div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{f.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.25rem' }}>{f.desc}</p>
                  </div>
                  <Link to={f.href} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    fontSize: '0.875rem', fontWeight: 600, color: f.ctaColor,
                    textDecoration: 'none',
                  }}>
                    {f.cta} <ArrowRight style={{ width: 14, height: 14 }} />
                  </Link>
                </div>
              );
            })}
          </div>
          <style>{`
            @media (min-width: 640px)  { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (min-width: 1024px) { .features-grid { grid-template-columns: repeat(4, 1fr) !important; } }
          `}</style>
        </div>
      </section>

      {/* ── Featured Companies ────────────────────────────────────────────── */}
      <section style={{ padding: '3.5rem 0', background: '#fff', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2563eb', marginBottom: '0.25rem' }}>
                Featured Recruiter Drives
              </div>
              <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>
                Top Recruiting Companies
              </h2>
            </div>
            <Link to="/companies" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.875rem', fontWeight: 600, color: '#2563eb', textDecoration: 'none',
            }}>
              Browse all {stats.companiesCount} companies <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.25rem' }} className="companies-grid">
              {[1, 2, 3, 4, 5, 6].map(i => <CompanyCardSkeleton key={i} />)}
            </div>
          ) : featuredCompanies.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.25rem' }} className="companies-grid">
                {featuredCompanies.map(c => <CompanyCard key={c._id} company={c} />)}
              </div>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/companies" className="btn btn-navy">
                  View All {stats.companiesCount} Companies
                  <ChevronRight style={{ width: 15, height: 15 }} />
                </Link>
              </div>
              <style>{`
                @media (min-width: 640px)  { .companies-grid { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (min-width: 1024px) { .companies-grid { grid-template-columns: repeat(3, 1fr) !important; } }
              `}</style>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', fontSize: '0.875rem' }}>
              No companies found in database.
            </div>
          )}
        </div>
      </section>

      {/* ── Secondary Links ───────────────────────────────────────────────── */}
      <section style={{ padding: '3rem 0 4rem', background: '#f9fafb' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }} className="links-grid">
            {/* Alumni */}
            <Link to="/alumni" style={{
              display: 'flex', alignItems: 'flex-start', gap: '1rem',
              padding: '1.5rem', borderRadius: 16,
              background: '#fff', border: '1px solid #e5e7eb',
              textDecoration: 'none', color: 'inherit',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgb(0 0 0 / 0.07)'; e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users style={{ width: 22, height: 22, color: '#7c3aed' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem' }}>Alumni Network</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                  Connect with GECR Computer Dept graduates at top companies for mentorship.
                </p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: '#7c3aed' }}>
                  Browse Alumni <ArrowRight style={{ width: 13, height: 13 }} />
                </span>
              </div>
            </Link>

            {/* Resources */}
            <Link to="/learning-material" style={{
              display: 'flex', alignItems: 'flex-start', gap: '1rem',
              padding: '1.5rem', borderRadius: 16,
              background: '#fff', border: '1px solid #e5e7eb',
              textDecoration: 'none', color: 'inherit',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgb(0 0 0 / 0.07)'; e.currentTarget.style.borderColor = '#86efac'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BookOpen style={{ width: 22, height: 22, color: '#16a34a' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem' }}>Preparation Resources</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                  Download DSA sheets, aptitude guides, OS/DBMS notes, and SQL prep sets.
                </p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: '#16a34a' }}>
                  View Resources <ArrowRight style={{ width: 13, height: 13 }} />
                </span>
              </div>
            </Link>
          </div>
          <style>{`
            @media (min-width: 768px) { .links-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          `}</style>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
