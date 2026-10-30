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
    desc: 'Priority-ordered recruiting companies with complete interview timelines, selection criteria, and round breakdowns.',
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
    navigate(searchQuery.trim() ? `/companies?search=${encodeURIComponent(searchQuery.trim())}` : '/companies');
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
              color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 600,
              marginBottom: '1.5rem',
              boxShadow: '0 1px 4px rgb(0 0 0 / 0.06)',
            }}>
              <img src="/gecr-logo.png" alt="GECR" width="14" height="14" style={{ objectFit: 'contain' }} />
              <span>GEC Rajkot · Computer Department</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#93c5fd' }} />
              <span style={{ color: '#60a5fa' }}>Placement Portal</span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.12,
              letterSpacing: '-0.035em',
              marginBottom: '1rem',
            }}>
              Ace Your Placement{' '}
              <span style={{ color: '#1a56db' }}>with Real Insights</span>
            </h1>

            <p style={{
              fontSize: '1.0625rem', color: '#6b7280', lineHeight: 1.7,
              marginBottom: '2rem', maxWidth: 520, margin: '0 auto 2rem',
            }}>
              Verified interview experiences, authentic question banks, company-wise
              selection processes — all gathered from GECR students.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ maxWidth: 540, margin: '0 auto 1.25rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: '#fff', borderRadius: 14,
                border: '1.5px solid #e5e7eb',
                boxShadow: '0 2px 12px rgb(0 0 0 / 0.07)',
                padding: '0.375rem 0.375rem 0.375rem 1rem',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
                onFocus={e => { e.currentTarget.style.borderColor = '#60a5fa'; e.currentTarget.style.boxShadow = '0 2px 12px rgb(0 0 0 / 0.07), 0 0 0 3px rgb(96 165 250 / 0.15)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 2px 12px rgb(0 0 0 / 0.07)'; }}
              >
                <Search style={{ width: 18, height: 18, color: '#9ca3af', flexShrink: 0, marginRight: '0.5rem' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search companies — TSS, Kevit, TatvaSoft..."
                  style={{
                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                    fontSize: '0.9rem', color: '#111827',
                  }}
                  aria-label="Search companies"
                />
                <button type="submit" style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 1rem', borderRadius: 10,
                  background: '#1a56db', color: '#fff',
                  border: 'none', fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1e40af'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1a56db'}
                >
                  <span className="hide-mobile">Search</span>
                  <ArrowRight style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </form>

            {/* Quick chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', alignSelf: 'center' }}>Priority:</span>
              {PRIORITY_COMPANIES.map(name => (
                <button
                  key={name}
                  onClick={() => navigate(`/companies?search=${encodeURIComponent(name)}`)}
                  style={{
                    padding: '0.275rem 0.7rem', borderRadius: 8,
                    background: '#fff', border: '1px solid #e5e7eb',
                    fontSize: '0.75rem', fontWeight: 500, color: '#374151',
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = '#1d4ed8'; e.currentTarget.style.background = '#eff6ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#fff'; }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.875rem', maxWidth: 700, margin: '3rem auto 0',
          }}
            className="stats-grid"
          >
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{
                  background: '#fff', border: '1px solid #e5e7eb',
                  borderRadius: 14, padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  boxShadow: '0 1px 3px rgb(0 0 0 / 0.05)',
                  transition: 'box-shadow 0.15s, transform 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgb(0 0 0 / 0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgb(0 0 0 / 0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon style={{ width: 18, height: 18, color: s.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.04em' }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500, marginTop: 2, lineHeight: 1.3 }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <style>{`
            @media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(4, 1fr) !important; } }
          `}</style>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '4rem 0', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}>
              What's Inside
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#0f172a', marginBottom: '0.625rem' }}>
              Everything you need to crack placements
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9375rem', maxWidth: 500, margin: '0 auto' }}>
              Comprehensive resources built from real GECR student experiences.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }} className="features-grid">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Link key={i} to={f.href} style={{
                  display: 'block',
                  background: '#fff', border: '1px solid #e5e7eb',
                  borderRadius: 16, padding: '1.5rem',
                  textDecoration: 'none', color: 'inherit',
                  transition: 'all 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgb(0 0 0 / 0.08)'; e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: f.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.125rem',
                  }}>
                    <Icon style={{ width: 22, height: 22, color: f.iconColor }} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                    {f.desc}
                  </p>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    fontSize: '0.8125rem', fontWeight: 600, color: f.ctaColor,
                  }}>
                    {f.cta} <ArrowRight style={{ width: 14, height: 14 }} />
                  </span>
                </Link>
              );
            })}
          </div>
          <style>{`
            @media (min-width: 640px)  { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (min-width: 1024px) { .features-grid { grid-template-columns: repeat(4, 1fr) !important; } }
          `}</style>
        </div>
      </section>

      {/* ── Practice CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: '3.5rem 0', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #0f2d5e 0%, #1a56db 100%)',
            borderRadius: 20, padding: '2.5rem 2rem',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
          }} className="practice-cta">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.25rem 0.75rem', borderRadius: 999, background: 'rgba(255,255,255,0.15)',
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', color: '#93c5fd',
                textTransform: 'uppercase', marginBottom: '0.875rem',
              }}>
                Practice Arena
              </div>
              <h2 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.875rem)', fontWeight: 800, color: '#fff', marginBottom: '0.625rem', letterSpacing: '-0.025em' }}>
                Practice DSA & SQL questions<br />from real GECR placements
              </h2>
              <p style={{ color: '#93c5fd', fontSize: '0.9375rem', lineHeight: 1.65 }}>
                Curated problems from LeetCode, GeeksforGeeks, HackerRank and more —
                filtered by company, topic, and difficulty.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Link to="/practice" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6875rem 1.5rem', borderRadius: 12,
                background: '#fff', color: '#1a56db',
                fontSize: '0.875rem', fontWeight: 700,
                textDecoration: 'none', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Code2 style={{ width: 15, height: 15 }} />
                <span>Browse All Practice</span>
              </Link>
              <Link to="/practice/dsa" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6875rem 1.25rem', borderRadius: 12,
                background: 'rgba(255,255,255,0.12)', color: '#e0f2fe',
                fontSize: '0.875rem', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.15s',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              >
                DSA Problems
              </Link>
              <Link to="/practice/sql" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6875rem 1.25rem', borderRadius: 12,
                background: 'rgba(255,255,255,0.12)', color: '#e0f2fe',
                fontSize: '0.875rem', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.15s',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              >
                SQL Practice
              </Link>
            </div>
          </div>
          <style>{`
            @media (min-width: 768px) {
              .practice-cta { flex-direction: row !important; align-items: center; justify-content: space-between; }
              .practice-cta > div:first-child { flex: 1; }
              .practice-cta > div:last-child { flex-shrink: 0; flex-direction: column; align-items: flex-start; }
            }
          `}</style>
        </div>
      </section>

      {/* ── Featured Companies ────────────────────────────────────────────── */}
      <section style={{ padding: '4rem 0 3rem', background: '#fff' }}>
        <div className="container">
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem',
          }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: '0.625rem' }}>
                <Star style={{ width: 10, height: 10 }} />
                Priority Companies
              </div>
              <h2 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.75rem)', fontWeight: 800, color: '#0f172a', marginBottom: '0.375rem' }}>
                Recruiting Companies & Processes
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Real multi-round breakdowns, selection criteria, and candidate tips.
              </p>
            </div>
            <Link to="/companies" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.875rem', fontWeight: 600, color: '#2563eb',
              textDecoration: 'none', flexShrink: 0,
            }}>
              View All ({stats.companiesCount}) <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }} className="companies-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CompanyCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredCompanies.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }} className="companies-grid">
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
