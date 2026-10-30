import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Share2, Check,
  ShieldCheck, Building2, Code2, Database, AlertCircle,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const DIFF_STYLES = {
  Easy:   { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', dot: '#22c55e' },
  Medium: { bg: '#fffbeb', color: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  Hard:   { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', dot: '#ef4444' },
};

const PLATFORM_STYLES = {
  LeetCode:      { bg: '#2563eb', hover: '#1d4ed8' },
  GeeksforGeeks: { bg: '#16a34a', hover: '#15803d' },
  HackerRank:    { bg: '#059669', hover: '#047857' },
  'SQL-Practice': { bg: '#0369a1', hover: '#075985' },
  InterviewBit:  { bg: '#7c3aed', hover: '#6d28d9' },
  CodeChef:      { bg: '#b45309', hover: '#92400e' },
};

export const CodingWorkspacePage = () => {
  const { slug } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    api.getCodingQuestionBySlug(slug)
      .then(res => {
        if (!mounted) return;
        if (res.success && res.data) setQuestion(res.data);
        else setError(res.message || 'Question not found');
      })
      .catch(() => { if (mounted) setError('Failed to load question.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: question?.title, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { window.prompt('Copy link:', url); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <LoadingSpinner message="Loading question..." />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem' }}>
        <div style={{ maxWidth: 400, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '2.5rem', textAlign: 'center', boxShadow: '0 4px 20px rgb(0 0 0 / 0.06)' }}>
          <div style={{ width: 52, height: 52, background: '#fef2f2', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <AlertCircle style={{ width: 24, height: 24, color: '#dc2626' }} />
          </div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Question Not Found</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            {error || 'This question does not exist or has been moved.'}
          </p>
          <Link to="/practice" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.5rem 1.25rem', borderRadius: 10,
            background: '#2563eb', color: '#fff',
            fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
          }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Practice
          </Link>
        </div>
      </div>
    );
  }

  const diff = DIFF_STYLES[question.difficulty] || DIFF_STYLES.Easy;
  const platform = question.platform || 'LeetCode';
  const platformStyle = PLATFORM_STYLES[platform] || { bg: '#374151', hover: '#1f2937' };
  const isVerified = question.companyTagSource === 'verified' || question.companyTagSource === 'gecr-pyq' || question.companyTagSource === 'verified-pyq';
  const categoryHref = question.category === 'SQL' ? '/practice/sql' : '/practice/dsa';
  const nav = question.navigation || {};

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '1.5rem 0 3rem' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        {/* Breadcrumb + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="breadcrumb">
            <Link to="/practice" className="">Practice</Link>
            <span style={{ color: '#d1d5db' }}>/</span>
            <Link to={categoryHref}>{question.category}</Link>
            <span style={{ color: '#d1d5db' }}>/</span>
            <span className="current" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
              {question.title}
            </span>
          </div>
          <button onClick={handleShare} style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.4rem 0.875rem', borderRadius: 8,
            background: '#fff', border: '1px solid #e5e7eb',
            fontSize: '0.75rem', fontWeight: 600, color: '#374151',
            cursor: 'pointer', transition: 'all 0.12s',
          }}>
            {copied ? <><Check style={{ width: 13, height: 13, color: '#16a34a' }} />Copied!</> : <><Share2 style={{ width: 13, height: 13 }} />Share</>}
          </button>
        </div>

        {/* Main Card */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgb(0 0 0 / 0.05)' }}>
          {/* Question Header */}
          <div style={{ padding: '2rem', borderBottom: '1px solid #f3f4f6' }}>
            {/* Tags row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.2rem 0.625rem', borderRadius: 999,
                background: question.category === 'SQL' ? '#f0f9ff' : '#f5f3ff',
                color: question.category === 'SQL' ? '#0369a1' : '#7c3aed',
                border: `1px solid ${question.category === 'SQL' ? '#bae6fd' : '#ddd6fe'}`,
                fontSize: '0.75rem', fontWeight: 700,
              }}>
                {question.category === 'SQL' ? <Database style={{ width: 11, height: 11 }} /> : <Code2 style={{ width: 11, height: 11 }} />}
                {question.category === 'DSA' && question.topic ? `DSA · ${question.topic}` : question.category}
              </span>

              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.2rem 0.625rem', borderRadius: 999,
                background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`,
                fontSize: '0.75rem', fontWeight: 700,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: diff.dot }} />
                {question.difficulty}
              </span>

              {isVerified && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.2rem 0.625rem', borderRadius: 999,
                  background: '#f5f3ff', color: '#5b21b6', border: '1px solid #ddd6fe',
                  fontSize: '0.7rem', fontWeight: 700,
                }}>
                  <ShieldCheck style={{ width: 11, height: 11 }} /> Verified GECR PYQ
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.25, marginBottom: '0.875rem' }}>
              {question.title}
            </h1>

            {/* Company tags */}
            {question.companyTags && question.companyTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>Recruiting companies:</span>
                {question.companyTags.map(c => (
                  <span key={c} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.15rem 0.55rem', borderRadius: 6,
                    background: '#fefce8', border: '1px solid #fde047',
                    fontSize: '0.75rem', fontWeight: 600, color: '#854d0e',
                  }}>
                    🔥 {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Interview Context */}
            {question.interviewContext && !/excel/i.test(question.interviewContext) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem 1.125rem', borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <Building2 style={{ width: 16, height: 16, color: '#2563eb', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    Placement Context
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.6, margin: 0 }}>
                    {question.interviewContext}
                  </p>
                </div>
              </div>
            )}

            {/* Problem Statement */}
            <div>
              <h2 style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>
                Problem Description
              </h2>
              <div style={{
                fontSize: '0.9375rem', color: '#374151', lineHeight: 1.75,
                whiteSpace: 'pre-wrap', fontFamily: 'inherit',
                background: '#f9fafb', padding: '1.25rem', borderRadius: 12,
                border: '1px solid #f3f4f6',
              }}>
                {question.statement}
              </div>
            </div>

            {/* Constraints */}
            {question.constraints && (
              <div>
                <h3 style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                  Constraints
                </h3>
                <div className="code-block">{question.constraints}</div>
              </div>
            )}

            {/* Examples */}
            {question.examples && question.examples.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>
                  Examples
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {question.examples.map((ex, i) => (
                    <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem' }}>
                      <div style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.5rem' }}>Example {i + 1}</div>
                      <div><span style={{ color: '#6b7280' }}>Input: </span><span style={{ color: '#1d4ed8', fontWeight: 600 }}>{ex.input}</span></div>
                      <div><span style={{ color: '#6b7280' }}>Output: </span><span style={{ color: '#15803d', fontWeight: 600 }}>{ex.output}</span></div>
                      {ex.explanation && (
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb', color: '#6b7280', fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem' }}>
                          <span style={{ fontWeight: 600 }}>Explanation: </span>{ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '1rem',
              padding: '1.25rem 1.5rem', borderRadius: 14,
              background: '#f9fafb', border: '1px solid #e5e7eb',
              marginTop: '0.5rem',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>
                  Solve on Platform
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                  Practice this problem on{' '}
                  <span style={{ color: platformStyle.bg }}>{platform}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                  Opens the official problem with full test suite and online editor.
                </p>
              </div>

              {question.externalUrl ? (
                <a href={question.externalUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1.5rem', borderRadius: 12,
                    background: platformStyle.bg, color: '#fff',
                    fontSize: '0.9375rem', fontWeight: 700, textDecoration: 'none',
                    flexShrink: 0, transition: 'all 0.15s',
                    boxShadow: `0 4px 14px ${platformStyle.bg}40`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = platformStyle.hover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = platformStyle.bg; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Solve on {platform} <ExternalLink style={{ width: 15, height: 15 }} />
                </a>
              ) : (
                <div style={{ fontSize: '0.8125rem', color: '#9ca3af', padding: '0.5rem 1rem', background: '#e5e7eb', borderRadius: 10 }}>
                  Link pending verification
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prev / Next Navigation */}
        {(nav.prev || nav.next) && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            {nav.prev ? (
              <Link to={`/practice/${nav.prev.slug}`}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.875rem 1.125rem', borderRadius: 12,
                  background: '#fff', border: '1px solid #e5e7eb',
                  textDecoration: 'none', color: '#374151', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = '0 2px 8px rgb(0 0 0 / 0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <ChevronLeft style={{ width: 18, height: 18, color: '#9ca3af', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Previous</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {nav.prev.title}
                  </div>
                </div>
              </Link>
            ) : <div style={{ flex: 1 }} />}
            {nav.next ? (
              <Link to={`/practice/${nav.next.slug}`}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem',
                  padding: '0.875rem 1.125rem', borderRadius: 12,
                  background: '#fff', border: '1px solid #e5e7eb',
                  textDecoration: 'none', color: '#374151', transition: 'all 0.15s', textAlign: 'right',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = '0 2px 8px rgb(0 0 0 / 0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {nav.next.title}
                  </div>
                </div>
                <ChevronRight style={{ width: 18, height: 18, color: '#9ca3af', flexShrink: 0 }} />
              </Link>
            ) : <div style={{ flex: 1 }} />}
          </div>
        )}
      </div>
    </div>
  );
};
