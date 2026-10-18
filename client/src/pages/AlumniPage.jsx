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
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { CompanyLogo } from '../components/CompanyLogo';

export const AlumniPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQueryParam = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchQueryParam);

  const [alumni, setAlumni] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 30, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Sync with searchParams
  useEffect(() => {
    setSearchQuery(searchQueryParam);
  }, [searchQueryParam]);

  // Fetch alumni from API (backend sorts featured records first)
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        const res = await api.getAlumni({
          search: searchQuery,
          limit: 60,
        });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold mb-3 border border-blue-100">
          <Users className="w-3.5 h-3.5 text-blue-700" />
          <span>GECR Placement Sarthi • Professional Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Alumni Directory
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
          Connect with Government Engineering College Rajkot graduates working across premier software and engineering companies. Discover career trajectories and reach out for mentorship.
        </p>
      </div>

      {/* Search Bar at Top */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:p-4 mb-8">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search alumni by graduate name or company (e.g., Kevit, TatvaSoft, TSS, Software Engineer)..."
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Meta Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-6 px-1">
        <span>
          Showing {alumni.length} of {pagination.total}{' '}
          {pagination.total === 1 ? 'alumni member' : 'alumni members'}
          {searchQuery ? ` matching "${searchQuery}"` : ''}
        </span>

        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="text-blue-700 hover:text-blue-900 font-semibold transition-colors cursor-pointer"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Alumni Directory Grid: Exactly 3 columns on Desktop, 2 on Tablet, 1 on Mobile */}
      {loading ? (
        <LoadingSpinner message="Loading alumni network directory..." />
      ) : alumni.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((member) => (
            <div
              key={member._id}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative shadow-2xs hover:shadow-md ${
                member.isFeatured
                  ? 'border-blue-300 ring-1 ring-blue-500/20'
                  : 'border-slate-200/90 hover:border-blue-200'
              }`}
            >
              {/* Featured Badge */}
              {member.isFeatured && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  <Star className="w-3 h-3 fill-blue-600 text-blue-600" />
                  <span>Featured Alumni</span>
                </div>
              )}

              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3.5">
                  {/* Company Logo or Member Avatar */}
                  <CompanyLogo
                    src={member.companyLogo}
                    name={member.companyName}
                    size="md"
                    className="border-slate-200"
                  />

                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">
                      {member.name}
                    </h3>

                    {member.jobTitle ? (
                      <p className="text-xs font-medium text-slate-600 flex items-center gap-1 mt-0.5 line-clamp-1">
                        <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{member.jobTitle}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5">Alumni Graduate</p>
                    )}

                    <div className="flex items-center gap-1 text-xs text-blue-800 font-semibold mt-1">
                      <Building2 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span className="line-clamp-1">{member.companyName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LinkedIn Action Button */}
              <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Professional Profile</span>
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold shadow-2xs transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>Connect</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No alumni records found"
          description={
            searchQuery
              ? `No alumni matching "${searchQuery}" were found. Try searching by first name, last name, or recruiting company.`
              : "No alumni profiles have been published yet. Once the administrator adds alumni details or graduates share their LinkedIn profiles, they will appear here."
          }
          actionLabel={searchQuery ? "Clear search" : undefined}
          onAction={handleClearSearch}
        />
      )}
    </div>
  );
};
