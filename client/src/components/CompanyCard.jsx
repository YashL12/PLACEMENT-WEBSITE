import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Layers, ExternalLink } from 'lucide-react';
import { Badge } from './Badge';
import { CompanyLogo } from './CompanyLogo';

export const CompanyCard = ({ company }) => {
  if (!company) return null;

  const years = company.placementYears || [];
  const expCount = company.totalExperiencesCount || 0;

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <CompanyLogo
            src={company.logoUrl}
            name={company.name}
            size="md"
            className="flex-shrink-0 group-hover:border-blue-200 transition-colors"
          />
          <div className="flex-1 min-w-0">
            <Link
              to={`/companies/${company._id}`}
              className="text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors line-clamp-1 leading-tight block"
            >
              {company.name}
            </Link>

            {/* Aliases */}
            {company.aliases && company.aliases.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mt-1.5">
                {company.aliases.slice(0, 3).map((alias, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 leading-none"
                  >
                    {alias}
                  </span>
                ))}
                {company.aliases.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{company.aliases.length - 3}</span>
                )}
              </div>
            )}

            {/* Website */}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 mt-1 transition-colors"
                aria-label={`Visit ${company.name} website (opens in new tab)`}
              >
                <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                <span className="line-clamp-1">{company.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        {company.about ? (
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {company.about}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic mb-4">
            Interview process &amp; question bank available.
          </p>
        )}

        {/* Placement years */}
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
          <span className="text-xs text-slate-500 font-medium">Seasons:</span>
          {years.length > 0 ? (
            years.map((yr) => (
              <Badge key={yr} variant={yr === 2025 ? 'year2025' : 'year2024'}>
                {yr}
              </Badge>
            ))
          ) : (
            <Badge variant="yearUnknown">Recorded</Badge>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Layers className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>
            {expCount} {expCount === 1 ? 'Experience' : 'Experiences'}
          </span>
        </div>

        <Link
          to={`/companies/${company._id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors group-hover:gap-1.5"
          aria-label={`View interview process for ${company.name}`}
        >
          <span>View Process</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};
