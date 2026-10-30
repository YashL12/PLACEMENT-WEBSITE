import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, X, ArrowUpDown, RefreshCw, ExternalLink,
  ChevronDown, ArrowLeft, Filter, ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const DIFF_STYLES = {
  Easy:   { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', dot: '#22c55e' },
  Medium: { bg: '#fffbeb', color: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  Hard:   { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', dot: '#ef4444' },
};

const PLATFORM_COLORS = {
  LeetCode:      { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  GeeksforGeeks: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  HackerRank:    { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  'SQL-Practice': { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  InterviewBit:  { bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe' },
  CodeChef:      { bg: '#fff7ed', color: '#b45309', border: '#fde68a' },
  Codeforces:    { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
};

const PlatformBadge = ({ platform }) => {
  const s = PLATFORM_COLORS[platform] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.15rem 0.5rem', borderRadius: 999,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: '0.6875rem', fontWeight: 600,
    }}>
      {platform}
    </span>
  );
};

const DiffBadge = ({ difficulty }) => {
  const s = DIFF_STYLES[difficulty] || DIFF_STYLES.Easy;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.15rem 0.55rem', borderRadius: 999,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: '0.6875rem', fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {difficulty}
    </span>
  );
};

const QuestionRow = ({ q }) => {
  const isVerified = q.companyTagSource === 'verified' || q.companyTagSource === 'gecr-pyq' || q.companyTagSource === 'verified-pyq';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.875rem 1.25rem', borderBottom: '1px solid #f3f4f6',
      gap: '0.75rem', transition: 'background 0.1s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Left: title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
          {q.topic && (
            <span style={{
              fontSize: '0.6875rem', fontWeight: 600, color: '#2563eb',
              background: '#eff6ff', border: '1px solid #bfdbfe',
              padding: '0.1rem 0.5rem', borderRadius: 999,
            }}>{q.topic}</span>
          )}
          <DiffBadge difficulty={q.difficulty} />
          {isVerified && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', fontWeight: 700, color: '#4f46e5', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '0.1rem 0.5rem', borderRadius: 999 }}>
              <ShieldCheck style={{ width: 10, height: 10 }} />Verified PYQ
            </span>
          )}
        </div>
        <Link to={`/practice/${q.slug}`} style={{
          fontSize: '0.9375rem', fontWeight: 600, color: '#111827',
          textDecoration: 'none', display: 'block',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          transition: 'color 0.1s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
          onMouseLeave={e => e.currentTarget.style.color = '#111827'}
        >
          {q.title}
        </Link>
        {q.companyTags && q.companyTags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
            {q.companyTags.slice(0, 3).map(c => (
              <span key={c} style={{ fontSize: '0.65rem', fontWeight: 500, color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '0.1rem 0.4rem', borderRadius: 6 }}>
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right: platform + action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
        <PlatformBadge platform={q.platform || 'LeetCode'} />
        {q.externalUrl ? (
          <a href={q.externalUrl} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.375rem 0.75rem', borderRadius: 8,
              background: '#2563eb', color: '#fff',
              fontSize: '0.75rem', fontWeight: 700,
              textDecoration: 'none', transition: 'all 0.12s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Practice <ExternalLink style={{ width: 11, height: 11 }} />
          </a>
        ) : (
          <Link to={`/practice/${q.slug}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.375rem 0.75rem', borderRadius: 8,
              background: '#f3f4f6', color: '#374151',
              fontSize: '0.75rem', fontWeight: 600,
              textDecoration: 'none', transition: 'background 0.12s', flexShrink: 0,
            }}
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
};

/**
 * Shared question listing component for DSA and SQL practice pages.
 * category: 'DSA' | 'SQL'
 * topics: string[] — available topic filter options
 * backLink/backLabel: for breadcrumb
 */
export const QuestionListing = ({
  category,
  topics = [],
  accentColor = '#2563eb',
  accentBg = '#eff6ff',
  title,
  subtitle,
  icon: HeaderIcon,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTopic      = searchParams.get('topic')      || 'All';
  const selectedDifficulty = searchParams.get('difficulty') || 'All';
  const selectedPlatform   = searchParams.get('platform')   || 'All';
  const searchQuery        = searchParams.get('q')          || '';
  const sortOrder          = searchParams.get('order')      || 'asc';

  const [searchTerm, setSearchTerm]   = useState(searchQuery);
  const [questions, setQuestions]     = useState([]);
  const [totalCount, setTotalCount]   = useState(0);
  const [matchCount, setMatchCount]   = useState(0);
  const [platforms, setPlatforms]     = useState([]);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef(null);

  const updateParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (!value || value === 'All' || value === '') next.delete(key);
      else next.set(key, value);
      return next;
    });
    setPage(1);
  }, [setSearchParams]);

  const handleReset = () => {
    setSearchTerm('');
    setSearchParams({});
    setPage(1);
  };

  // Load category-level meta once
  useEffect(() => {
    api.getCodingMeta().then(res => {
      if (res.success && res.data) {
        const catPlatforms = (res.data.platforms || []);
        setPlatforms(catPlatforms);
        setTotalCount(category === 'DSA' ? res.data.codingCount : res.data.sqlCount);
      }
    }).catch(() => {});
  }, [category]);

  // Reset page to 1 when any filter changes
  useEffect(() => {
    setPage(1);
  }, [category, selectedTopic, selectedDifficulty, selectedPlatform, searchQuery, sortOrder]);

  // Fetch questions
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        if (page === 1) setLoading(true); else setLoadingMore(true);
        const params = { category, page, limit: 30, sort: sortOrder === 'asc' ? 'difficulty-asc' : 'difficulty-desc' };
        if (selectedTopic !== 'All') params.topic = selectedTopic;
        if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
        if (selectedPlatform !== 'All') params.platform = selectedPlatform;
        if (searchQuery) params.search = searchQuery;

        const res = await api.getCodingQuestions(params);
        if (mounted && res.success && res.data) {
          const q = res.data.questions || [];
          setMatchCount(res.data.pagination?.total || 0);
          setHasMore(Boolean(res.data.pagination?.hasMore));
          setQuestions(prev => page === 1 ? q : [...prev, ...q]);
        }
      } catch (e) { console.error(e); }
      finally { if (mounted) { setLoading(false); setLoadingMore(false); } }
    };
    fetch();
    return () => { mounted = false; };
  }, [category, selectedTopic, selectedDifficulty, selectedPlatform, searchQuery, sortOrder, page]);

  const hasFilters = selectedTopic !== 'All' || selectedDifficulty !== 'All' || selectedPlatform !== 'All' || Boolean(searchQuery);

  const topicOptions = ['All', ...topics];

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '2rem 0 1.75rem' }}>
        <div className="container">
          <Link to="/practice" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280', textDecoration: 'none', marginBottom: '1rem', transition: 'color 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
            onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Practice
          </Link>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {HeaderIcon && <HeaderIcon style={{ width: 20, height: 20, color: accentColor }} />}
                </div>
                <h1 style={{ fontSize: 'clamp(1.375rem, 3vw, 2rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
                  {title}
                </h1>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{subtitle}</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.875rem 1.25rem', borderRadius: 12,
              background: accentBg, border: `1px solid ${accentColor}22`,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: accentColor, lineHeight: 1 }}>{totalCount}</div>
                <div style={{ fontSize: '0.6875rem', color: '#6b7280', fontWeight: 500 }}>Questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '1.75rem 1.25rem' }}>
        {/* Filter Bar */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Search + Sort */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af', pointerEvents: 'none' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  clearTimeout(debounceRef.current);
                  debounceRef.current = setTimeout(() => updateParam('q', e.target.value.trim()), 350);
                }}
                placeholder={`Search ${category} questions...`}
                style={{
                  width: '100%', paddingLeft: '2.25rem', paddingRight: searchTerm ? '2.25rem' : '0.875rem',
                  paddingTop: '0.5rem', paddingBottom: '0.5rem',
                  background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10,
                  fontSize: '0.875rem', color: '#111827', outline: 'none', transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              {searchTerm && (
                <button onClick={() => { setSearchTerm(''); updateParam('q', ''); }}
                  style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#9ca3af' }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>
            <button onClick={() => updateParam('order', sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 0.875rem', borderRadius: 10,
                background: '#f3f4f6', border: '1px solid #e5e7eb',
                fontSize: '0.8125rem', fontWeight: 600, color: '#374151', cursor: 'pointer',
                transition: 'all 0.12s', flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
              onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
            >
              <ArrowUpDown style={{ width: 13, height: 13, color: '#6b7280' }} />
              {sortOrder === 'asc' ? 'Easy → Hard' : 'Hard → Easy'}
            </button>
            {hasFilters && (
              <button onClick={handleReset} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 0.875rem', borderRadius: 10, border: 'none',
                background: 'none', fontSize: '0.8125rem', fontWeight: 600,
                color: '#dc2626', cursor: 'pointer',
              }}>
                <RefreshCw style={{ width: 13, height: 13 }} /> Reset
              </button>
            )}
          </div>

          {/* Filter Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {/* Difficulty tabs */}
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => updateParam('difficulty', d)}
                  style={{
                    padding: '0.3rem 0.75rem', borderRadius: 999,
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    border: '1px solid transparent', transition: 'all 0.12s',
                    background: selectedDifficulty === d ? accentColor : '#f3f4f6',
                    color: selectedDifficulty === d ? '#fff' : '#6b7280',
                    borderColor: selectedDifficulty === d ? accentColor : 'transparent',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Topic filter */}
            {topicOptions.length > 2 && (
              <select value={selectedTopic} onChange={e => updateParam('topic', e.target.value)}
                className="filter-select"
                style={{ maxWidth: 220 }}
              >
                {topicOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}

            {/* Platform filter */}
            {platforms.length > 0 && (
              <select value={selectedPlatform} onChange={e => updateParam('platform', e.target.value)}
                className="filter-select"
              >
                <option value="All">All Platforms</option>
                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            )}

            {/* Count */}
            <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
              Showing <strong style={{ color: '#111827' }}>{questions.length}</strong> of <strong style={{ color: '#111827' }}>{matchCount}</strong>
            </div>
          </div>
        </div>

        {/* Question Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <LoadingSpinner message={`Loading ${category} questions...`} />
          </div>
        ) : questions.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, background: '#f3f4f6', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Search style={{ width: 22, height: 22, color: '#9ca3af' }} />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>No questions found</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.25rem' }}>
              Try different filters or reset to see all questions.
            </p>
            <button onClick={handleReset} className="btn btn-outline btn-sm">Reset Filters</button>
          </div>
        ) : (
          <>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.625rem 1.25rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
                fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                <span>Question</span>
                <span>Platform / Action</span>
              </div>

              {questions.map(q => <QuestionRow key={q.slug || q._id} q={q} />)}
            </div>

            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loadingMore}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.625rem 1.5rem', borderRadius: 10,
                    background: '#fff', border: '1px solid #d1d5db',
                    fontSize: '0.875rem', fontWeight: 600, color: '#374151',
                    cursor: loadingMore ? 'not-allowed' : 'pointer',
                    opacity: loadingMore ? 0.6 : 1,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!loadingMore) e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  {loadingMore ? (
                    <><span className="spinner spinner-sm" />Loading...</>
                  ) : (
                    <><ChevronDown style={{ width: 15, height: 15 }} />Load More</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
