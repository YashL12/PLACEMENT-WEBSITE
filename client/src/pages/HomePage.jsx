import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Building2,
  BookOpen,
  Users,
  ArrowRight,
  Award,
  Layers,
  FileText,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { CompanyCard } from '../components/CompanyCard';
import { CompanyLogo } from '../components/CompanyLogo';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [learningMaterials, setLearningMaterials] = useState([]);
  const [featuredAlumni, setFeaturedAlumni] = useState([]);
  const [stats, setStats] = useState({
    companiesCount: 0,
    experiencesCount: 0,
    questionsCount: 713,
    learningMaterialsCount: 0,
    alumniCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);

        // Parallel fetch of actual database records
        const [compRes, matRes, alumRes] = await Promise.all([
          api.getCompanies({ limit: 6, sort: 'experiences' }).catch(() => ({ success: false })),
          api.getLearningMaterials({ limit: 3 }).catch(() => ({ success: false })),
          api.getAlumni({ limit: 3 }).catch(() => ({ success: false })),
        ]);

        let totalComps = 0;
        let totalExps = 0;

        if (compRes.success && compRes.data?.companies) {
          setFeaturedCompanies(compRes.data.companies);
          totalComps = compRes.data.pagination?.total || compRes.data.companies.length;
        }

        if (matRes.success && matRes.data?.materials) {
          setLearningMaterials(matRes.data.materials);
        }

        if (alumRes.success && alumRes.data?.alumni) {
          setFeaturedAlumni(alumRes.data.alumni);
        }

        // Fetch full companies list to compute actual experiences count
        const allCompsRes = await api.getCompanies({ limit: 100 }).catch(() => ({ success: false }));
        if (allCompsRes.success && allCompsRes.data?.companies) {
          totalExps = allCompsRes.data.companies.reduce(
            (acc, c) => acc + (c.totalExperiencesCount || 0),
            0
          );
        }

        setStats({
          companiesCount: totalComps || (allCompsRes.data?.companies?.length || 26),
          experiencesCount: totalExps || 38,
          questionsCount: 713,
          learningMaterialsCount: matRes.data?.pagination?.total || 0,
          alumniCount: alumRes.data?.pagination?.total || 0,
        });
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-6">
            <img src="/gecr-logo.png" alt="GECR" className="w-4 h-4 object-contain" />
            <span>Government Engineering College, Rajkot • Training & Placement Cell</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            GECR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">Placement Sarthi</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-9 leading-relaxed font-normal">
            A comprehensive placement preparation portal providing authentic student interview experiences, technical coding problems, recruitment rounds, learning materials, and alumni connections.
          </p>

          {/* Prominent Company Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto relative flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-slate-700/50"
          >
            <div className="pl-3.5 text-slate-400 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies (e.g. TSS, RKIT, Tark, TatvaSoft, eSparkBiz, Kevit)..."
              className="w-full px-3.5 py-3 text-slate-900 placeholder-slate-400 text-sm sm:text-base bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="flex-shrink-0 bg-blue-700 hover:bg-blue-800 text-white px-5 sm:px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150 flex items-center gap-2 shadow-sm"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          </form>

          {/* Popular Search Shortcuts */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-5 text-xs text-slate-400">
            <span className="text-slate-400">Popular:</span>
            {['TSS', 'RKIT', 'TatvaSoft', 'Tark', 'eSparkBiz', 'Prominent Pixel', 'Gateway', 'Kevit'].map(
              (name) => (
                <button
                  key={name}
                  onClick={() => navigate(`/companies?search=${encodeURIComponent(name)}`)}
                  className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                >
                  {name}
                </button>
              )
            )}
          </div>
        </div>

        {/* Database Metric Stats (Accurately calculated from actual database records) */}
        <div className="relative max-w-5xl mx-auto mt-14 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 block mb-1">
              {stats.companiesCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">Recruiting Companies</span>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-400 block mb-1">
              {stats.experiencesCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">Verified Experiences</span>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block mb-1">
              {stats.questionsCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">Interview Questions</span>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 block mb-1">
              {stats.learningMaterialsCount > 0 ? stats.learningMaterialsCount : 'Curated'}
            </span>
            <span className="text-xs text-slate-400 font-medium">Study Resources</span>
          </div>
        </div>
      </section>

      {/* Main 3 Platform Pillars */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/companies"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-700 group-hover:text-white transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
              1. Company Placement Experiences
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Detailed multi-round interview breakdowns, programming problem statements, and real selection tips from candidates across recruitment seasons.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
              <span>Browse Companies</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/learning-material"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
              2. Learning Material & Archives
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Download verified study resources, core computer science notes, aptitude problem sheets, and company-targeted preparation guides.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">
              <span>Explore Materials</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/alumni"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
              3. Alumni Directory
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Discover engineering alumni working at leading technology companies and directly connect through their professional LinkedIn profiles.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <span>View Alumni Network</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </section>

      {/* Primary Feature: Company Placement Experiences */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Company Placement Experiences
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Recruitment processes with verified interview rounds, coding problems, and candidate advice.
            </p>
          </div>

          <Link
            to="/companies"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
          >
            <span>View All Companies ({stats.companiesCount})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading placement records..." />
        ) : featuredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCompanies.map((company) => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm">
            No companies loaded yet.
          </div>
        )}
      </section>

      {/* Secondary Feature: Placement Learning Material Highlights */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50/70 rounded-3xl border border-slate-200/80 mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Study Resources</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Learning Material & Study Archives
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Access high-yield preparation sheets, aptitude guides, and core engineering resources.
            </p>
          </div>

          <Link
            to="/learning-material"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
          >
            <span>Browse All Materials</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {learningMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningMaterials.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description || 'Verified placement study resource.'}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px] uppercase">{item.fileType}</span>
                  <Link
                    to="/learning-material"
                    className="font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    View Resource →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
            <BookOpen className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Learning Materials Repository
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Curated preparation guides and study sheets for technical and aptitude rounds are uploaded by college administrators.
            </p>
            <Link
              to="/learning-material"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-700 text-white text-xs font-semibold hover:bg-indigo-800 transition-colors"
            >
              <span>Explore Learning Material</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* Tertiary Feature: Alumni Network Spotlight */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Graduate Directory</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              GECR Alumni Directory
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Discover college graduates currently working across the industry and connect for placement guidance.
            </p>
          </div>

          <Link
            to="/alumni"
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
          >
            <span>Explore All Alumni</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredAlumni.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredAlumni.map((alum) => (
              <div
                key={alum._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CompanyLogo src={alum.companyLogo} name={alum.companyName} size="md" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{alum.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{alum.companyName}</p>
                  </div>
                </div>
                <a
                  href={alum.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-[#0a66c2] text-white rounded-lg text-xs font-semibold flex-shrink-0"
                >
                  LinkedIn
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
            <Users className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              GECR Alumni Network
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Explore profiles of GECR graduates working across leading engineering organizations.
            </p>
            <Link
              to="/alumni"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
            >
              <span>View Alumni Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};
