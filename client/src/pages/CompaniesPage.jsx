import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, SearchX, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { CompanyCard } from '../components/CompanyCard';
import { SearchBar } from '../components/SearchBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
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

  // Sync state with search params changes
  useEffect(() => {
    setSearchQuery(searchQueryParam);
    setCurrentPage(pageQueryParam);
  }, [searchQueryParam, pageQueryParam]);

  // Fetch companies from backend API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await api.getCompanies({
          search: searchQuery,
          page: currentPage,
          limit: 12,
        });

        if (res.success && res.data) {
          setCompanies(res.data.companies);
          setPagination(res.data.pagination);
        }
      } catch (error) {
        console.error('Failed to load companies:', error);
      } finally {
        setLoading(false);
      }
    };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-100">
          <Building2 className="w-3.5 h-3.5 text-blue-700" />
          <span>GECR Placement Sarthi • Recruiting Companies</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Browse Placement Companies
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
          Access complete multi-round interview breakdowns, round-by-round selection criteria, and authentic interview questions for each company.
        </p>
      </div>

      {/* Intuitive Search Bar without redundant filters */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          updateFilters({ search: val });
        }}
        onClear={handleClearFilters}
        placeholder="Search company by name or alias (e.g. TSS, RKIT, Tark, TatvaSoft, eSparkBiz, Kevit)..."
      />

      {/* Results Meta Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-6 px-1">
        <span>
          Showing {companies.length} of {pagination.total} {pagination.total === 1 ? 'company' : 'companies'}
          {searchQuery ? ` matching "${searchQuery}"` : ''}
        </span>

        {searchQuery && (
          <button
            onClick={handleClearFilters}
            className="text-blue-700 hover:text-blue-900 font-semibold transition-colors"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Companies Grid or Empty State */}
      {loading ? (
        <LoadingSpinner message="Searching placement records..." />
      ) : companies.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-slate-200">
              <button
                disabled={currentPage <= 1}
                onClick={() => {
                  const newPage = currentPage - 1;
                  setCurrentPage(newPage);
                  updateFilters({ page: newPage.toString() });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-medium text-slate-600 px-3">
                Page {currentPage} of {pagination.pages}
              </span>

              <button
                disabled={currentPage >= pagination.pages}
                onClick={() => {
                  const newPage = currentPage + 1;
                  setCurrentPage(newPage);
                  updateFilters({ page: newPage.toString() });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={SearchX}
          title={`No companies matching "${searchQuery}"`}
          description="We couldn't find any placement records matching your current query. Try searching for an alias (e.g. TSS, RKIT, Tark) or reset your search."
          actionLabel="Clear search"
          onAction={handleClearFilters}
        />
      )}
    </div>
  );
};
