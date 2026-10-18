import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Download,
  ExternalLink,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Layers,
  Calendar,
  Building2,
  FolderOpen,
  X,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { CompanyLogo } from '../components/CompanyLogo';

const CATEGORIES = [
  'All Categories',
  'DSA & Problem Solving',
  'Aptitude & Logical Reasoning',
  'Core CS (OS, DBMS, CN)',
  'Web & Full Stack Development',
  'System Design',
  'Interview Prep & HR',
  'Company Specific Archives',
];

export const LearningMaterialPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQueryParam = searchParams.get('search') || '';
  const categoryQueryParam = searchParams.get('category') || '';
  const companyQueryParam = searchParams.get('company') || '';

  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryQueryParam);
  const [selectedCompany, setSelectedCompany] = useState(companyQueryParam);

  const [materials, setMaterials] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Sync with searchParams
  useEffect(() => {
    setSearchQuery(searchQueryParam);
    setSelectedCategory(categoryQueryParam);
    setSelectedCompany(companyQueryParam);
  }, [searchQueryParam, categoryQueryParam, companyQueryParam]);

  // Load companies for the filter dropdown
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await api.getCompanies({ limit: 100 });
        if (res.success && res.data?.companies) {
          setCompanies(res.data.companies);
        }
      } catch (err) {
        console.error('Failed to load companies for filter:', err);
      }
    };
    loadCompanies();
  }, []);

  // Fetch materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const res = await api.getLearningMaterials({
          search: searchQuery,
          category: selectedCategory === 'All Categories' ? '' : selectedCategory,
          company: selectedCompany,
          limit: 30,
        });

        if (res.success && res.data) {
          setMaterials(res.data.materials || []);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Failed to fetch learning materials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [searchQuery, selectedCategory, selectedCompany]);

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.keys(newParams).forEach((key) => {
      if (!newParams[key] || newParams[key] === 'All Categories') {
        params.delete(key);
      } else {
        params.set(key, newParams[key]);
      }
    });
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCompany('');
    setSearchParams({});
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return null;
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getFileIcon = (fileType) => {
    const type = (fileType || '').toUpperCase();
    if (type.includes('PDF')) return <FileText className="w-5 h-5 text-rose-600" />;
    if (type.includes('DOC')) return <FileText className="w-5 h-5 text-blue-600" />;
    if (type.includes('PPT')) return <FileText className="w-5 h-5 text-amber-600" />;
    if (type.includes('XLS')) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    if (type.includes('ZIP')) return <FileArchive className="w-5 h-5 text-purple-600" />;
    if (type.includes('LINK')) return <ExternalLink className="w-5 h-5 text-sky-600" />;
    return <FileCode className="w-5 h-5 text-slate-600" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold mb-3 border border-blue-100">
          <BookOpen className="w-3.5 h-3.5 text-blue-700" />
          <span>GECR Placement Sarthi • Study Resources</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Placement Learning Material
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
          Curated study resources, question banks, coding practice sheets, and domain-specific placement guides verified for campus recruitment.
        </p>
      </div>

      {/* Search and Category Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              updateFilters({ search: e.target.value });
            }}
            placeholder="Search learning materials by title, subject, or keywords..."
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                updateFilters({ search: '' });
              }}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Company Filter Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Category Chips Scrollable */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active =
                (!selectedCategory && cat === 'All Categories') ||
                selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    const next = cat === 'All Categories' ? '' : cat;
                    setSelectedCategory(next);
                    updateFilters({ category: next });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-700 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Company filter */}
          {companies.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-slate-400 font-medium hidden md:inline">Company:</span>
              <select
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                  updateFilters({ company: e.target.value });
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Companies</option>
                {companies.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results Meta Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-6 px-1">
        <span>
          Showing {materials.length} of {pagination.total}{' '}
          {pagination.total === 1 ? 'study resource' : 'study resources'}
          {selectedCategory ? ` in "${selectedCategory}"` : ''}
          {selectedCompany ? ` for "${selectedCompany}"` : ''}
        </span>

        {(searchQuery || selectedCategory || selectedCompany) && (
          <button
            onClick={handleClearFilters}
            className="text-blue-700 hover:text-blue-900 font-semibold transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Materials List / Grid */}
      {loading ? (
        <LoadingSpinner message="Loading placement learning resources..." />
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((item) => {
            const isExternal = item.isExternalLink;
            const sizeStr = formatFileSize(item.fileSize);
            const downloadUrl = item.isExternalLink
              ? item.fileUrl
              : `/api/learning-materials/${item._id}/download`;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 sm:p-6">
                  {/* Category & File Type */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                        {getFileIcon(item.fileType)}
                      </div>
                      <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                        {item.category}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono font-semibold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {item.fileType || 'FILE'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug mb-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description ? (
                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic mb-4">
                      Official preparation document for campus placement.
                    </p>
                  )}

                  {/* Associated Company if any */}
                  {item.companyName && (
                    <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200/80">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-medium text-slate-700 line-clamp-1">
                        Relevant Company: <strong className="text-slate-900">{item.companyName}</strong>
                      </span>
                    </div>
                  )}

                  {/* Metadata (File size, Date) */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    {sizeStr && <span>{sizeStr}</span>}
                    {sizeStr && <span>•</span>}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.createdAt)}</span>
                    </span>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                  <a
                    href={downloadUrl}
                    target={isExternal ? '_blank' : '_self'}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    download={!isExternal}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    {isExternal ? (
                      <>
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Resource Link</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Resource</span>
                      </>
                    )}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No learning resources found"
          description={
            searchQuery || selectedCategory || selectedCompany
              ? "No resources match your current filter. Try clearing filters or searching for different topics."
              : "No learning materials have been uploaded yet. Resources uploaded by the administrator will appear here for all students."
          }
          actionLabel={searchQuery || selectedCategory || selectedCompany ? "Clear filters" : undefined}
          onAction={handleClearFilters}
        />
      )}
    </div>
  );
};
