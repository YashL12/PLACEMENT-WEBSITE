import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Share2, Check, ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

const DIFFICULTY_STYLES = {
  Easy: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Medium: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  Hard: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

const PLATFORM_STYLES = {
  LeetCode: {
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    text: 'text-orange-600',
    name: 'LeetCode',
  },
  GeeksforGeeks: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    text: 'text-emerald-700',
    name: 'GeeksforGeeks',
  },
  HackerRank: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-600',
    name: 'HackerRank',
  },
  CodeStudio: {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    text: 'text-indigo-600',
    name: 'CodeStudio',
  },
  'SQL-Practice': {
    badge: 'bg-sky-50 text-sky-800 border-sky-200',
    text: 'text-sky-700',
    name: 'SQL-Practice',
  },
};

export const CodingQuestionCard = ({ question }) => {
  const [copied, setCopied] = useState(false);

  const diffStyle = DIFFICULTY_STYLES[question.difficulty] || DIFFICULTY_STYLES.Easy;
  const platform = question.platform || 'LeetCode';
  const platformStyle = PLATFORM_STYLES[platform] || {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    text: 'text-slate-600',
    name: platform,
  };

  const tagLabel = question.category === 'DSA' && question.topic ? question.topic : question.category;
  const isVerifiedPyq = question.companyTagSource === 'verified' || question.companyTagSource === 'gecr-pyq' || question.companyTagSource === 'verified-pyq';

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/practice/${question.slug}`;
    const shareData = {
      title: `${question.title} | GECRPlacement`,
      text: `Practice this ${question.difficulty} problem asked in campus placement: ${question.title}`,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('Share error:', err);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy problem link:', url);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Top bar: Category/Topic badge + Difficulty + Provenance */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {tagLabel && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                {tagLabel}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${diffStyle.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot}`} />
              {question.difficulty}
            </span>

            {isVerifiedPyq && (
              <span
                title="Verified from GECR student placement reports"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80"
              >
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                <span>Verified PYQ</span>
              </span>
            )}
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            title="Share question link"
            aria-label={`Share ${question.title}`}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Title */}
        <Link
          to={`/practice/${question.slug}`}
          className="block group-hover:text-blue-600 font-bold text-slate-900 text-base sm:text-lg leading-snug transition-colors mb-2.5"
        >
          {question.title}
        </Link>

        {/* Interview context or short notes if available */}
        {question.interviewContext && !/excel/i.test(question.interviewContext) && (
          <p className="text-xs text-slate-500 mb-3 line-clamp-1 italic">
            "{question.interviewContext}"
          </p>
        )}
      </div>

      {/* Bottom Section: Company tags + Solve on Platform Button */}
      <div className="pt-3 border-t border-slate-100 space-y-3 mt-2">
        {/* Company Tags */}
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {question.companyTags && question.companyTags.length > 0 ? (
            question.companyTags.map((comp) => (
              <span
                key={comp}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md border border-slate-200/60 truncate transition-colors"
              >
                <span aria-hidden="true">🔥</span>
                <span>{comp}</span>
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">Core Placement Practice</span>
          )}
        </div>

        {/* Action Row: Platform Badge + Primary "Solve on [Platform]" CTA */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <Link
            to={`/practice/${question.slug}`}
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {question.externalUrl ? (
            <a
              href={question.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Solve ${question.title} on ${platformStyle.name}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-sm transition-all duration-150 flex-shrink-0 group-hover:bg-blue-700"
            >
              <span>Solve on {platformStyle.name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Link pending</span>
          )}
        </div>
      </div>
    </div>
  );
};
