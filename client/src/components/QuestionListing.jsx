import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, X, ArrowUpDown, RefreshCw, ExternalLink,
  ChevronDown, ArrowLeft, Filter, ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { tracker } from '../services/tracker';

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
        <PlatformBadge platform={q.platform} />
        <Link to={`/practice/${q.slug}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
          padding: '0.35rem 0.75rem', borderRadius: 8,
          background: '#f9fafb', border: '1px solid #e5e7eb',
          fontSize: '0.75rem', fontWeight: 600, color: '#2563eb',
          textDecoration: 'none', transition: 'all 0.12s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#2563eb'; }}
        >
          View Problem
        </Link>
      </div>
    </div>
  );
};

export const QuestionListing = ({ category, title, description, accentColor = '#2563eb' }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [questions, setQuestions]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [hasMore, setHasMore]           = useState(false);
  const [page, setPage]                 = useState(1);
  const [matchCount, setMatchCount]     = useState(0);

  const [topicOptions, setTopicOptions] = useState(['All']);
  const [platforms, setPlatforms]       = useState([]);

  // URL-driven filter states
  const searchQuery        = searchParams.get('q')          || '';
  const selectedDifficulty = searchParams.get('difficulty') || 'All';
  const selectedTopic      = searchParams.get('topic')      || 'All';
  const selectedPlatform   = searchParams.get('platform')   || 'All';

  const [inputSearch, setInputSearch] = useState(searchQuery);
  const searchDebounceTimer = useRef(null);

  // Sync input with URL
  useEffect(() => { setInputSearch(searchQuery); }, [searchQuery]);

  // Load topics & platforms metadata once
  useEffect(() => {
    api.getCodingMeta()
      .then(res => {
        if (!res.success || !res.data) return;
        const d = res.data;
        if (category === 'DSA' && d.topics) {
          setTopicOptions(['All', ...d.topics.map(t => t.topic)]);
        } else if (category === 'SQL' && d.sqlTopics) {
          setTopicOptions(['All', ...d.sqlTopics.map(t => t.topic)]);
        }
        if (d.platforms) setPlatforms(d.platforms);
      })
      .catch(() => {});
  }, [category]);

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (!val || val === 'All' || val === '') {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    setSearchParams(next, { replace: true });
    setPage(1);
  };

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setInputSearch(v);
    clearTimeout(searchDebounceTimer.current);
    searchDebounceTimer.current = setTimeout(() => {
      updateParam('q', v);
      if (v.trim().length >= 2) {
        tracker.trackSearch(v.trim(), 'practice');
      }
    }, 300);
  };

  const handleClearSearch = () => {
    setInputSearch('');
    updateParam('q', '');
  };

  const handleReset = () => {
    setInputSearch('');
    setSearchParams({}, { replace: true });
    setPage(1);
  };

  // Fetch questions
  useEffect(() => {
    let mounted = true;
    const isFirstPage = page === 1;
    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);

    const params = {
      category,
      page,
      limit: 25,
    };
    if (searchQuery)                            params.q          = searchQuery;
    if (selectedDifficulty && selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
    if (selectedTopic      && selectedTopic      !== 'All') params.topic      = selectedTopic;
    if (selectedPlatform   && selectedPlatform   !== 'All') params.platform   = selectedPlatform;

    api.getCodingQuestions(params)
      .then(res => {
        if (!mounted) return;
        if (res.success && res.data) {
          const { questions: fetched, pagination } = res.data;
          setQuestions(prev => isFirstPage ? fetched : [...prev, ...fetched]);
          setHasMore(pagination.page < pagination.totalPages);
          setMatchCount(pagination.total);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
        setLoadingMore(false);
      });

    return () => { mounted = false; };
  }, [category, page, searchQuery, selectedDifficulty, selectedTopic, selectedPlatform]);

  const hasActiveFilters = Boolean(searchQuery || selectedDifficulty !== 'All' || selectedTopic !== 'All' || selectedPlatform !== 'All');

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '2rem 0 1.5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Link to="/practice" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.8125rem', color: '#6b7280', textDecoration: 'none', fontWeight: 500,
            }}>
              <ArrowLeft style={{ width: 14, height: 14 }} /> Practice
            </Link>
            <span style={{ color: '#d1d5db' }}>/</span>
            <span style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: 600 }}>{category}</span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 0.375rem' }}>
            {title}
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#6b7280', margin: 0, maxWidth: 640 }}>
            {description}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        {/* Controls Card */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem',
          boxShadow: '0 1px 3px rgb(0 0 0 / 0.04)',
        }}>
          {/* Row 1: Search */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ width: 16, height: 16, color: '#9ca3af', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={inputSearch}
                onChange={handleSearchChange}
                placeholder={`Search ${category} by title, topic, company...`}
                style={{
                  width: '100%', padding: '0.55rem 2.25rem 0.55rem 2.25rem',
                  border: '1px solid #d1d5db', borderRadius: 10,
                  fontSize: '0.875rem', color: '#111827', outline: 'none',
                  background: '#f9fafb', boxSizing: 'border-box',
                }}
              />
              {inputSearch && (
                <button onClick={handleClearSearch} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>
            {hasActiveFilters && (
              <button onClick={handleReset} style={{
                padding: '0.55rem 0.875rem', borderRadius: 10,
                background: '#f3f4f6', border: '1px solid #e5e7eb',
                fontSize: '0.8125rem', fontWeight: 600, color: '#4b5563',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                Reset
              </button>
            )}
          </div>

          {/* Row 2: Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', alignItems: 'center' }}>
            {/* Difficulty Pills */}
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => updateParam('difficulty', d)}
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

export default QuestionListing;
