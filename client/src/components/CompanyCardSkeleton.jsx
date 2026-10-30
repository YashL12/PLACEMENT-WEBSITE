import React from 'react';

export const CompanyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden animate-pulse">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Logo Skeleton */}
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title Skeleton */}
            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            {/* Aliases Skeleton */}
            <div className="flex gap-1.5 pt-0.5">
              <div className="h-3 bg-slate-100 rounded w-12" />
              <div className="h-3 bg-slate-100 rounded w-16" />
            </div>
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="space-y-1.5 mb-5">
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-4/5" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3 bg-slate-100 rounded w-14" />
          <div className="h-5 bg-slate-100 rounded-full w-12" />
          <div className="h-5 bg-slate-100 rounded-full w-12" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="h-3.5 bg-slate-200 rounded w-24" />
        <div className="h-3.5 bg-slate-200 rounded w-20" />
      </div>
    </div>
  );
};
