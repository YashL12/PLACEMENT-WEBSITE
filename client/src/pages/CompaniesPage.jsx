import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, SearchX, ChevronLeft, ChevronRight, Search, X, AlertCircle, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import { CompanyCard } from '../components/CompanyCard';
import { CompanyCardSkeleton } from '../components/CompanyCardSkeleton';
import { EmptyState } from '../components/EmptyState';

export const CompaniesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQueryParam = searchParams.get('search') || '';
  const pageQueryParam = parseInt(searchParams.get('page') || '1', 10);

  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const [currentPage, setCurrentPage] = useState(pageQueryParam);

  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCompanies({
        search: searchQuery,
        page: currentPage,
        limit: 12,
      });

      if (res.success && res.data) {
        setCompanies(res.data.companies || []);
        setPagination(res.data.pagination || { total: 0, page: 1, limit: 12, pages: 1 });
      } else {
        setError(res.message || 'Failed to retrieve companies');
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError(err.message || 'Failed to load company directory. Please check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery(searchQueryParam);
    setCurrentPage(pageQueryParam);
  }, [searchQueryParam, pageQueryParam]);

  useEffect(() => {
    fetchCompanies();
  }, [searchQuery, currentPage]);

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.keys(newParams).forEach((key) => {
      if (newParams[key] === '' || newParams[key] === null || newParams[key] === undefined) {
        params.delete(key);
      } else {
        params.set(key, newParams[key]);
      }
    });
    if ('search' in newParams) {
      params.set('page', '1');
      setCurrentPage(1);
    }
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="section-eyebrow mb-3">
            <Building2 className="w-3 h-3" aria-hidden="true" />
            Company Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Placement Companies &amp; Interview Processes
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Explore authentic multi-round interview breakdowns, round-by-round selection criteria,
            and verified interview questions for each recruiting company.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-blue-400 focus-within:shadow-md focus-within:shadow-blue-50 transition-all duration-200 p-1.5">
            <div className="pl-3 text-slate-400 flex items-center pointer-events-none" aria-hidden="true">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateFilters({ search: e.target.value });
              }}
              placeholder="Search by company name or alias — TSS, RKIT, TatvaSoft, Kevit, eSparkBiz..."
              className="flex-1 px-3 py-2.5 text-slate-900 placeholder-slate-400 text-sm bg-transparent focus:outline-none"
              aria-label="Search companies"
              role="searchbox"
            />
            {searchQuery && (
              <button
                onClick={handleClearFilters}
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
            {loading ? 'Searching...' : (
              <>
                Showing <span className="text-slate-800 font-semibold">{companies.length}</span> of{' '}
                <span className="text-slate-800 font-semibold">{pagination.total}</span>{' '}
                {pagination.total === 1 ? 'company' : 'companies'}
                {searchQuery && <> matching &ldquo;<span className="text-blue-600">{searchQuery}</span>&rdquo;</>}
              </>
            )}
          </span>
          {searchQuery && (
            <button
              onClick={handleClearFilters}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Error state with retry */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchCompanies}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Companies grid or skeleton state */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <CompanyCardSkeleton key={idx} />
            ))}
          </div>
        ) : companies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {companies.map((company) => (
                <CompanyCard key={company._id} company={company} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <nav
                className="flex items-center justify-center gap-3 mt-12 pt-6 border-t border-slate-200"
                aria-label="Pagination"
              >
                <button
                  disabled={currentPage <= 1}
                  onClick={() => {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    updateFilters({ page: newPage.toString() });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-medium text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200">
                  Page <span className="text-slate-900 font-bold">{currentPage}</span> of{' '}
                  <span className="text-slate-900 font-bold">{pagination.pages}</span>
                </span>

                <button
                  disabled={currentPage >= pagination.pages}
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    updateFilters({ page: newPage.toString() });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </>
        ) : (
          <EmptyState
            icon={SearchX}
            title={searchQuery ? `No companies matching "${searchQuery}"` : 'No companies found'}
            description="We couldn't find any placement records matching your search. Try a shorter keyword or different alias — e.g., TSS, RKIT, Kevit."
            actionLabel="Clear search"
            onAction={handleClearFilters}
          />
        )}
      </div>
    </div>
  );
};
