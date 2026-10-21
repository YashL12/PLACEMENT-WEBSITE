import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  ExternalLink,
  Building2,
  Briefcase,
  Star,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { AlumniAvatar } from '../components/AlumniAvatar';

export const AlumniPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQueryParam = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchQueryParam);

  const [alumni, setAlumni] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 30, pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchQuery(searchQueryParam);
  }, [searchQueryParam]);

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        const res = await api.getAlumni({ search: searchQuery, limit: 60 });
        if (res.success && res.data) {
          setAlumni(res.data.alumni || []);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Failed to load alumni directory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, [searchQuery]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const params = new URLSearchParams(searchParams);
    if (val.trim()) {
      params.set('search', val.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="section-eyebrow mb-3">
            <Users className="w-3 h-3" aria-hidden="true" />
            Professional Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            GECR Alumni Directory
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Connect with Government Engineering College Rajkot graduates working at premier
            technology companies. Reach out for mentorship, referrals, and career guidance.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-blue-400 focus-within:shadow-md focus-within:shadow-blue-50 transition-all duration-200 p-1.5">
            <div className="pl-3 text-slate-400 flex items-center pointer-events-none" aria-hidden="true">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by alumni name or company — Kevit, TatvaSoft, TSS, Software Engineer..."
              className="flex-1 px-3 py-2.5 text-slate-900 placeholder-slate-400 text-sm bg-transparent focus:outline-none"
              aria-label="Search alumni"
              role="searchbox"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="flex-shrink-0 mr-1 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-6">
          <span>
            {loading ? 'Loading...' : (
              <>
                Showing <span className="text-slate-800 font-semibold">{alumni.length}</span> of{' '}
                <span className="text-slate-800 font-semibold">{pagination.total}</span>{' '}
                {pagination.total === 1 ? 'alumnus' : 'alumni'}
                {searchQuery && <> matching &ldquo;<span className="text-blue-600">{searchQuery}</span>&rdquo;</>}
              </>
            )}
          </span>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Alumni grid */}
        {loading ? (
          <LoadingSpinner message="Loading alumni network directory..." />
        ) : alumni.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {alumni.map((member) => (
              <AlumniMemberCard key={member._id} member={member} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No alumni records found"
            description={
              searchQuery
                ? `No alumni matching "${searchQuery}" were found. Try searching by first name, last name, or company name.`
                : 'No alumni profiles have been published yet. Once graduates share their profiles, they will appear here.'
            }
            actionLabel={searchQuery ? 'Clear search' : undefined}
            onAction={searchQuery ? handleClearSearch : undefined}
          />
        )}
      </div>
    </div>
  );
};

// ─── Alumni Member Card ───
const AlumniMemberCard = ({ member }) => {
  return (
    <article
      className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden relative shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
        member.isFeatured
          ? 'border-blue-200 ring-1 ring-blue-100'
          : 'border-slate-200 hover:border-blue-200'
      }`}
    >
      {/* Featured badge */}
      {member.isFeatured && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold">
          <Star className="w-2.5 h-2.5 fill-blue-500 text-blue-500" aria-hidden="true" />
          <span>Featured</span>
        </div>
      )}

      <div className="p-5 sm:p-6 flex-1">
        <div className="flex items-start gap-4">
          <AlumniAvatar
            src={member.profilePhoto}
            name={member.name}
            size="md"
            className="border-slate-200 flex-shrink-0"
          />

          <div className="flex-1 min-w-0" style={{ paddingRight: member.isFeatured ? '4rem' : '0' }}>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight line-clamp-1 leading-tight">
              {member.name}
            </h3>

            {member.jobTitle ? (
              <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" aria-hidden="true" />
                <span className="line-clamp-1">{member.jobTitle}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1">GECR Graduate</p>
            )}

            <div className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-blue-700">
              <Building2 className="w-3 h-3 text-blue-500 flex-shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">{member.companyName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* LinkedIn action */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">LinkedIn Profile</span>
        {member.linkedinUrl ? (
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors shadow-xs"
            style={{ background: '#0a66c2' }}
            aria-label={`View ${member.name}'s LinkedIn profile (opens in new tab)`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
            <span>Connect</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        ) : (
          <span className="text-xs text-slate-400 italic">Not available</span>
        )}
      </div>
    </article>
  );
};
