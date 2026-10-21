import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Layers,
  Lightbulb,
  ExternalLink,
  ChevronLeft,
  Share2,
  FileText,
  GitBranch,
  FolderArchive,
  Users,
  Link2,
} from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/Badge';
import { RoundAccordion } from '../components/RoundAccordion';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { CompanyLogo } from '../components/CompanyLogo';
import { AlumniAvatar } from '../components/AlumniAvatar';

export const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [activeExperienceId, setActiveExperienceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getCompanyById(id);
        if (res.success && res.data) {
          const compData = res.data.company;
          setCompany(compData);
          setExperiences(res.data.experiences || []);
          if (res.data.experiences && res.data.experiences.length > 0) {
            setActiveExperienceId(res.data.experiences[0]._id);
          }

          // Fetch alumni for this company
          try {
            const alumRes = await api.getAlumni({ company: compData.name });
            if (alumRes.success && alumRes.data?.alumni) {
              setAlumni(alumRes.data.alumni);
            }
          } catch (e) {
            console.error('Failed to load company alumni:', e);
          }
        }
      } catch (err) {
        console.error('Failed to load company details:', err);
        setError(err.message || 'Company not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <LoadingSpinner message="Loading complete interview process..." size="large" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Company not found"
          description={error || "The company you requested does not exist or has not been published yet."}
          actionLabel="Back to all companies"
          onAction={() => navigate('/companies')}
        />
      </div>
    );
  }

  const activeExp =
    experiences.find((e) => e._id === activeExperienceId) || experiences[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between mb-6 text-xs text-slate-500 font-medium">
        <Link
          to="/companies"
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Company Directory</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors text-xs font-medium cursor-pointer shadow-2xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Link Copied!' : 'Share Company'}</span>
        </button>
      </div>

      {/* Company Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <CompanyLogo
              src={company.logoUrl}
              name={company.name}
              size="lg"
              className="border-slate-200 shadow-2xs"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {company.name}
              </h1>

              {/* Aliases List */}
              {company.aliases && company.aliases.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-xs text-slate-400 font-medium">Recognized Aliases:</span>
                  {company.aliases.map((alias, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              )}

              {/* Company Website Link if present */}
              {company.website && (
                <div className="mt-3">
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-medium hover:underline"
                  >
                    <span>{company.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-row md:flex-col items-start md:items-end gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Placement Seasons:</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {company.placementYears && company.placementYears.length > 0 ? (
                company.placementYears.map((yr) => (
                  <Badge key={yr} variant={yr === 2025 ? 'year2025' : 'year2024'}>
                    Season {yr}
                  </Badge>
                ))
              ) : (
                <Badge variant="yearUnknown">Recorded</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Company About */}
        {company.about && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-600 leading-relaxed">{company.about}</p>
          </div>
        )}

        {/* Company-Specific General Advice */}
        {company.generalAdvice && company.generalAdvice.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm mb-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Key Preparation & Interview Advice for {company.name}</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-amber-950 pl-5 list-disc leading-relaxed">
              {company.generalAdvice.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Embedded Alumni Information Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Alumni Network & Guidance for {company.name}
              </h2>
              <p className="text-xs text-slate-500">
                Connect with GECR Computer Department alumni working at {company.name}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {alumni.length} {alumni.length === 1 ? 'Alumnus' : 'Alumni'}
          </span>
        </div>

        {alumni.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {alumni.map((alum) => (
              <div
                key={alum._id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Alumnus Profile Photo (never company logo) */}
                  <AlumniAvatar
                    src={alum.profilePhoto}
                    name={alum.name}
                    size="md"
                    className="border-slate-300"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{alum.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{alum.jobTitle || 'Software Engineer'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CompanyLogo src={company.logoUrl} name={company.name} size="sm" className="w-4 h-4 text-[9px] p-0" />
                      <span className="text-[11px] text-slate-600 font-medium">{company.name}</span>
                    </div>
                  </div>
                </div>

                {/* LinkedIn Profile Button */}
                <a
                  href={alum.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg text-xs font-semibold transition-colors flex-shrink-0 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No alumni profiles currently registered for {company.name}. Department alumni working here are invited to connect with the Training & Placement cell.
          </div>
        )}
      </div>

      {/* Interview Experiences Section */}
      {experiences.length > 0 ? (
        <div>
          {/* Distinct Experiences Tab / Switcher */}
          {experiences.length > 1 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Interview Experience ({experiences.length} available)
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {experiences.map((exp, idx) => {
                  const isActive = exp._id === activeExp?._id;
                  const yearLabel = exp.placementYear
                    ? `Season ${exp.placementYear}`
                    : 'Recorded Experience';

                  return (
                    <button
                      key={exp._id}
                      onClick={() => setActiveExperienceId(exp._id)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                        isActive
                          ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{yearLabel}</span>
                      <span className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                        isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {exp.role || 'Software Engineer'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Experience Details Container */}
          {activeExp && (
            <div className="space-y-6">
              {/* Experience Overview Light Banner */}
              <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-2xs border border-slate-200/90">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-lg font-bold text-slate-900 tracking-tight">
                        {activeExp.role || 'Software Engineer'}
                      </span>
                      {activeExp.placementYear ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200">
                          Season {activeExp.placementYear}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">
                          Placement Archive Record
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <FolderArchive className="w-3.5 h-3.5" />
                      <span>Source: {activeExp.sourceDocument} ({activeExp.sourcePage || 'Reported'})</span>
                    </span>
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-xs font-semibold text-blue-800 border border-blue-100">
                    Total {activeExp.rounds?.length || activeExp.totalRoundsCount || 0} Interview Rounds
                  </div>
                </div>

                {/* Process Overview */}
                {activeExp.processOverview && (
                  <p className="text-sm text-slate-600 leading-relaxed font-normal mb-4">
                    {activeExp.processOverview}
                  </p>
                )}

                {/* Candidate Advice from Experience */}
                {activeExp.advice && activeExp.advice.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-2">
                      Reported Candidate Advice & Tips:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc leading-relaxed">
                      {activeExp.advice.map((adv, idx) => (
                        <li key={idx}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Alumni Contributions */}
                {activeExp.alumniContributions && activeExp.alumniContributions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block mb-2 flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-blue-700" />
                      <span>Alumni Solution Repository:</span>
                    </span>
                    <div className="space-y-2">
                      {activeExp.alumniContributions.map((contrib, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800">{contrib.name}</span>
                            {contrib.githubUrl && (
                              <a
                                href={contrib.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-mono hover:underline"
                              >
                                <span>{contrib.githubUrl.replace('https://github.com/', '')}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          {contrib.notes && (
                            <p className="text-slate-500 text-[11px] mt-1">{contrib.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Interview Rounds Header */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Interview Rounds & Preserved Questions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click any round to expand questions, problem statements, and constraints.
                  </p>
                </div>
              </div>

              {/* Collapsible Rounds List */}
              {activeExp.rounds && activeExp.rounds.length > 0 ? (
                <div className="space-y-3">
                  {activeExp.rounds.map((round, idx) => (
                    <RoundAccordion
                      key={round._id || idx}
                      round={round}
                      defaultOpen={idx === 0 || round.questions?.length <= 8}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs italic">
                  Round details are summarized in the process overview above.
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No interview experiences available"
          description="There are currently no recorded interview experiences for this company."
        />
      )}
    </div>
  );
};
