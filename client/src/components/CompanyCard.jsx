import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Layers } from 'lucide-react';
import { Badge } from './Badge';
import { CompanyLogo } from './CompanyLogo';

export const CompanyCard = ({ company }) => {
  if (!company) return null;

  const years = company.placementYears || [];
  const expCount = company.totalExperiencesCount || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5 sm:p-6">
        {/* Header with official logo */}
        <div className="flex items-start gap-3.5 mb-4">
          <CompanyLogo
            src={company.logoUrl}
            name={company.name}
            size="md"
            className="group-hover:border-blue-300 transition-colors"
          />
          <div className="flex-1 min-w-0">
            <Link
              to={`/companies/${company._id}`}
              className="text-base font-bold text-slate-900 hover:text-blue-700 transition-colors line-clamp-1"
            >
              {company.name}
            </Link>
            {company.aliases && company.aliases.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <span className="text-[11px] text-slate-400">Alias:</span>
                {company.aliases.slice(0, 2).map((alias, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                  >
                    {alias}
                  </span>
                ))}
                {company.aliases.length > 2 && (
                  <span className="text-[10px] text-slate-400">
                    +{company.aliases.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Company About / Description if available */}
        {company.about ? (
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed font-normal">
            {company.about}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic mb-4">
            Official recruitment processes and interview question breakdown.
          </p>
        )}

        {/* Placement Years */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Recorded Seasons:</span>
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
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {expCount} {expCount === 1 ? 'Interview Experience' : 'Experiences'}
          </span>
        </div>

        <Link
          to={`/companies/${company._id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors group-hover:translate-x-0.5 duration-150"
        >
          <span>View Process</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
