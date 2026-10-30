import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2, Database, ArrowRight, BookOpen,
  TrendingUp, Layers, Clock, Star, ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const DSA_TOPICS = [
  { label: 'Arrays',                    color: '#2563eb', bg: '#eff6ff' },
  { label: 'Strings',                   color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Linked Lists',              color: '#0891b2', bg: '#ecfeff' },
  { label: 'Stacks and Queues',         color: '#059669', bg: '#ecfdf5' },
  { label: 'Trees',                     color: '#d97706', bg: '#fffbeb' },
  { label: 'Graphs',                    color: '#dc2626', bg: '#fef2f2' },
  { label: 'Dynamic Programming',       color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Recursion and Backtracking', color: '#059669', bg: '#ecfdf5' },
  { label: 'Binary Search',             color: '#0891b2', bg: '#ecfeff' },
  { label: 'Hashing',                   color: '#d97706', bg: '#fffbeb' },
  { label: 'Two Pointers',              color: '#2563eb', bg: '#eff6ff' },
  { label: 'Heaps and Priority Queues', color: '#7c3aed', bg: '#f5f3ff' },
];

const SQL_TOPICS = [
  { label: 'SELECT and Filtering',  color: '#0369a1', bg: '#f0f9ff' },
  { label: 'Joins',                 color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'GROUP BY and HAVING',   color: '#059669', bg: '#ecfdf5' },
  { label: 'Window Functions',      color: '#d97706', bg: '#fffbeb' },
  { label: 'Subqueries',            color: '#dc2626', bg: '#fef2f2' },
  { label: 'Duplicate Detection',   color: '#0369a1', bg: '#f0f9ff' },
  { label: 'Date and Time Queries', color: '#0891b2', bg: '#ecfeff' },
  { label: 'Data Modification',     color: '#d97706', bg: '#fffbeb' },
];

export const PracticePage = () => {
  const [meta, setMeta] = useState({ totalCount: 0, codingCount: 0, sqlCount: 0, platforms: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCodingMeta()
      .then(res => { if (res.success && res.data) setMeta(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '2.5rem 0 2rem' }}>
        <div className="container">
          <div className="page-hero-eyebrow">
            <Code2 style={{ width: 10, height: 10 }} />
            Practice Arena
          </div>
          <h1 className="page-hero-title" style={{ marginBottom: '0.625rem' }}>
            Coding Practice Directory
          </h1>
          <p className="page-hero-subtitle">
            Curated placement questions from real GECR campus drives. Solve on LeetCode,
            GeeksforGeeks, HackerRank, and more.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
        {/* Stats Row */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '0.875rem', marginBottom: '2.5rem' }} className="practice-stats">
            {[
              { value: meta.totalCount, label: 'Total Questions', icon: Layers, color: '#2563eb', bg: '#eff6ff' },
              { value: meta.codingCount, label: 'DSA Questions', icon: Code2, color: '#7c3aed', bg: '#f5f3ff' },
              { value: meta.sqlCount, label: 'SQL Questions', icon: Database, color: '#0369a1', bg: '#f0f9ff' },
              { value: (meta.platforms || []).length, label: 'Platforms', icon: Star, color: '#d97706', bg: '#fffbeb' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
                  padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 18, height: 18, color: s.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.04em' }}>
                      {s.value || '—'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <style>{`@media (min-width: 640px) { .practice-stats { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>

        {/* Category Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }} className="category-cards">
          {/* DSA */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 3px rgb(0 0 0 / 0.05)' }}>
            <div style={{ padding: '1.75rem 1.75rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Code2 style={{ width: 26, height: 26, color: '#7c3aed' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>DSA Practice</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', background: '#f5f3ff', padding: '0.1rem 0.5rem', borderRadius: 999, border: '1px solid #ddd6fe' }}>
                        {meta.codingCount} questions
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>·</span>
                      <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Easy · Medium · Hard</span>
                    </div>
                  </div>
                </div>
                <Link to="/practice/dsa" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 1.125rem', borderRadius: 10,
                  background: '#7c3aed', color: '#fff',
                  fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none',
                  flexShrink: 0, transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#6d28d9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Practice DSA <ArrowRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.65, margin: 0 }}>
                Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, and more —
                covering all DSA topics asked in campus placement drives.
              </p>
            </div>
            {/* Topics grid */}
            <div style={{ padding: '1.25rem 1.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {DSA_TOPICS.map(t => (
                <Link key={t.label} to={`/practice/dsa?topic=${encodeURIComponent(t.label)}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '0.25rem 0.625rem', borderRadius: 999,
                    background: t.bg, color: t.color,
                    fontSize: '0.75rem', fontWeight: 600,
                    border: `1px solid ${t.color}22`, textDecoration: 'none',
                    transition: 'opacity 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {t.label}
                </Link>
              ))}
              <Link to="/practice/dsa" style={{ padding: '0.25rem 0.625rem', borderRadius: 999, background: '#f3f4f6', color: '#6b7280', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                +More
              </Link>
            </div>
          </div>

          {/* SQL */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 3px rgb(0 0 0 / 0.05)' }}>
            <div style={{ padding: '1.75rem 1.75rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Database style={{ width: 26, height: 26, color: '#0369a1' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>SQL Practice</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', background: '#f0f9ff', padding: '0.1rem 0.5rem', borderRadius: 999, border: '1px solid #bae6fd' }}>
                        {meta.sqlCount} questions
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>·</span>
                      <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Easy · Medium · Hard</span>
                    </div>
                  </div>
                </div>
                <Link to="/practice/sql" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 1.125rem', borderRadius: 10,
                  background: '#0369a1', color: '#fff',
                  fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none',
                  flexShrink: 0, transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#075985'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#0369a1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Practice SQL <ArrowRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.65, margin: 0 }}>
                SELECT, JOINs, Aggregation, Window Functions, CTEs, and advanced SQL concepts —
                all verified from SQL-Practice.com, LeetCode, and HackerRank.
              </p>
            </div>
            <div style={{ padding: '1.25rem 1.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {SQL_TOPICS.map(t => (
                <Link key={t.label} to={`/practice/sql?topic=${encodeURIComponent(t.label)}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '0.25rem 0.625rem', borderRadius: 999,
                    background: t.bg, color: t.color,
                    fontSize: '0.75rem', fontWeight: 600,
                    border: `1px solid ${t.color}22`, textDecoration: 'none',
                    transition: 'opacity 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <style>{`@media (min-width: 768px) { .category-cards { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>

        {/* Info Box */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
          padding: '1rem 1.25rem', borderRadius: 12,
          background: '#f0f9ff', border: '1px solid #bae6fd',
          fontSize: '0.875rem', color: '#0369a1',
        }}>
          <ExternalLink style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>External Platform:</strong> All questions link directly to verified problems on LeetCode, GeeksforGeeks, HackerRank, SQL-Practice.com, and other platforms.
            GECRPlacement serves as a curated directory — clicking "Practice" opens the real problem in a new tab.
          </div>
        </div>
      </div>
    </div>
  );
};
