import React from 'react';

export const CompanyDetailSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen animate-pulse">
      {/* Top back button skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 bg-slate-200 rounded w-40" />
        <div className="h-7 bg-slate-200 rounded-lg w-28" />
      </div>

      {/* Header Card Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-7 bg-slate-200 rounded-md w-3/5" />
              <div className="flex gap-2">
                <div className="h-4 bg-slate-100 rounded w-16" />
                <div className="h-4 bg-slate-100 rounded w-20" />
              </div>
              <div className="h-4 bg-slate-100 rounded w-5/6 pt-1" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-slate-100 rounded-xl w-24" />
            <div className="h-8 bg-slate-100 rounded-xl w-24" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 bg-slate-200 rounded w-48 mb-3" />
          {/* 3 Accordion Skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-100 rounded-full w-20" />
              </div>
              <div className="h-3.5 bg-slate-100 rounded w-3/4" />
              <div className="h-3.5 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
};
