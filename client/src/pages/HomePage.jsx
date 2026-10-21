import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Building2,
  BookOpen,
  ArrowRight,
  HelpCircle,
  GraduationCap,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
  Star,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { CompanyCard } from '../components/CompanyCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Quick company chips
const PRIORITY_COMPANIES = ['Kevit', 'TSS', 'RKIT', 'GN Websoft', 'TatvaSoft', 'eSparkBiz', 'Prominent Pixel', 'Gateway'];

// Feature pillars
const PILLARS = [
  {
    icon: Building2,
    label: 'Company Directory',
    description: 'Priority-ordered recruiting companies with complete interview timelines, selection criteria, and round-by-round breakdowns.',
    href: '/companies',
    cta: 'Browse Companies',
    color: 'blue',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    hoverBg: 'hover:bg-blue-600',
    border: 'hover:border-blue-300',
  },
  {
    icon: HelpCircle,
    label: 'Interview Questions',
    description: 'Over 1,400+ real coding problems, technical MCQs, algorithmic challenges, and HR round questions reported by GECR students.',
    href: '/companies',
    cta: 'Explore Questions',
    color: 'violet',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    hoverBg: 'hover:bg-violet-600',
    border: 'hover:border-violet-300',
  },
  {
    icon: BookOpen,
    label: 'Study Resources',
    description: 'Curated DSA cheatsheets, OS & DBMS guides, aptitude prep sheets, and company-specific archives from faculty and alumni.',
    href: '/learning-material',
    cta: 'View Resources',
    color: 'emerald',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    hoverBg: 'hover:bg-emerald-600',
    border: 'hover:border-emerald-300',
  },
];

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [stats, setStats] = useState({
    companiesCount: 26,
    experiencesCount: 76,
    questionsCount: 1426,
    learningMaterialsCount: 3,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [statsRes, compRes, matRes] = await Promise.all([
          api.getPublicStats().catch(() => ({ success: false })),
          api.getCompanies({ limit: 6 }).catch(() => ({ success: false })),
          api.getLearningMaterials({ limit: 3 }).catch(() => ({ success: false })),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats({
            companiesCount: statsRes.data.companiesCount || 26,
            experiencesCount: statsRes.data.experiencesCount || 76,
            questionsCount: statsRes.data.questionsCount || 1426,
            learningMaterialsCount: matRes.data?.pagination?.total || 3,
          });
        }

        if (compRes.success && compRes.data?.companies) {
          setFeaturedCompanies(compRes.data.companies);
        }
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/companies?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/companies');
    }
  };

  const statItems = [
    { value: stats.companiesCount, label: 'Recruiting Companies', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: stats.experiencesCount, label: 'Interview Experiences', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50' },
    { value: `${stats.questionsCount}+`, label: 'Interview Questions', icon: HelpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { value: stats.learningMaterialsCount, label: 'Study Resources', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>

      {/* ─── Hero Section ─── */}
      <section
        className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(160deg, #eff6ff 0%, #f8fafc 50%, #ffffff 100%)' }}
        aria-label="Hero section"
      >
        {/* Subtle background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-semibold mb-7 shadow-sm">
            <img src="/gecr-logo.png" alt="GECR" className="w-4 h-4 object-contain" aria-hidden="true" />
            <span>GEC Rajkot · Computer Department</span>
            <span className="w-1 h-1 rounded-full bg-blue-400" aria-hidden="true" />
            <span className="text-blue-500">Placement Portal</span>
          </div>

          {/* Main headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-5 leading-tight tracking-tight">
            Ace Your Placement{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
              with Real Insights
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Explore verified interview experiences, authentic question banks, company-wise selection
            processes, and curated study materials — all gathered from GECR students.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto"
            role="search"
            aria-label="Search companies"
          >
            <div className="flex items-center bg-white rounded-2xl shadow-md border border-slate-200 focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-100 transition-all duration-200 p-1.5">
              <div className="pl-3 text-slate-400 flex items-center pointer-events-none flex-shrink-0" aria-hidden="true">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies — Kevit, TSS, RKIT, TatvaSoft..."
                className="flex-1 px-3 py-2.5 text-slate-900 placeholder-slate-400 text-sm bg-transparent focus:outline-none"
                aria-label="Search companies by name"
              />
              <button
                type="submit"
                className="flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-150 flex items-center gap-2 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}
              >
                <span className="hidden sm:inline">Search</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </form>

          {/* Quick company chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-5" aria-label="Popular companies">
            <span className="text-xs text-slate-400 font-medium">Priority:</span>
            {PRIORITY_COMPANIES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => navigate(`/companies?search=${encodeURIComponent(name)}`)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 text-slate-600 text-xs font-medium transition-all duration-100 shadow-xs cursor-pointer"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative max-w-4xl mx-auto mt-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {statItems.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-4.5 h-4.5 ${stat.color}`} aria-hidden="true" />
                  </div>
                  <div className={`text-2xl sm:text-3xl font-extrabold ${stat.color} leading-none mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Platform Pillars ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-label="Platform features">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="section-eyebrow mx-auto mb-4">
            <Zap className="w-3 h-3" aria-hidden="true" />
            What's Inside
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything you need to crack placements
          </h2>
          <p className="text-sm text-slate-500 mt-3 max-w-xl mx-auto">
            Three powerful resources built from real GECR student experiences to help you prepare smarter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={idx}
                to={pillar.href}
                className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-250 overflow-hidden"
                style={{ '--hover-color': pillar.color }}
              >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 rounded-2xl`}
                  style={{ background: `linear-gradient(135deg, ${pillar.color === 'blue' ? '#eff6ff' : pillar.color === 'violet' ? '#f5f3ff' : '#f0fdf4'} 0%, transparent 60%)` }}
                  aria-hidden="true"
                />

                <div className="relative">
                  {/* Icon */}
                  <div className={`w-12 h-12 ${pillar.bg} rounded-xl flex items-center justify-center mb-5 transition-colors duration-200 group-hover:scale-110 transform`}>
                    <Icon className={`w-6 h-6 ${pillar.iconColor}`} aria-hidden="true" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {pillar.label}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5">
                    {pillar.description}
                  </p>

                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${pillar.iconColor} transition-all`}>
                    <span>{pillar.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Featured Companies ─── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-label="Featured companies">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="section-eyebrow mb-3">
              <Star className="w-3 h-3 fill-blue-600" aria-hidden="true" />
              Priority Companies
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Recruiting Companies &amp; Processes
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Real multi-round interview breakdowns, selection criteria, and candidate tips.
            </p>
          </div>
          <Link
            to="/companies"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
          >
            <span>View All ({stats.companiesCount})</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Company cards */}
        {loading ? (
          <LoadingSpinner message="Loading companies from database..." />
        ) : featuredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredCompanies.map((company) => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>
        ) : (
          <div className="text-center py-14 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            No companies found in database.
          </div>
        )}

        {/* Browse all CTA */}
        {!loading && featuredCompanies.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/companies"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <span>View All {stats.companiesCount} Companies</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>

      {/* ─── Quick Links / Alumni CTA ─── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8" aria-label="Additional resources">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Alumni Card */}
          <Link
            to="/alumni"
            className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-violet-200 transition-all duration-200 flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
              <Users className="w-6 h-6 text-violet-600" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-violet-700 transition-colors">
                Alumni Network
              </h3>
              <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                Connect with GECR Computer Department graduates at top companies for mentorship and guidance.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600">
                <span>Browse Alumni</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </div>
          </Link>

          {/* Study Resources Card */}
          <Link
            to="/learning-material"
            className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-emerald-200 transition-all duration-200 flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
              <TrendingUp className="w-6 h-6 text-emerald-600" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors">
                Preparation Resources
              </h3>
              <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                Download DSA sheets, aptitude guides, OS/DBMS notes, and SQL prep sets curated for placements.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <span>View Resources</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};
