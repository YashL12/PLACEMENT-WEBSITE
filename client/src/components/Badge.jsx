import React from 'react';

const typeStyles = {
  // Years
  year2025: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  year2024: 'bg-blue-50 text-blue-700 border-blue-200',
  yearUnknown: 'bg-slate-100 text-slate-700 border-slate-200',
  
  // Round Types
  Aptitude: 'bg-amber-50 text-amber-800 border-amber-200',
  Coding: 'bg-purple-50 text-purple-700 border-purple-200',
  Technical: 'bg-sky-50 text-sky-700 border-sky-200',
  HR: 'bg-rose-50 text-rose-700 border-rose-200',
  Personal: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Group Discussion': 'bg-teal-50 text-teal-700 border-teal-200',
  Practical: 'bg-orange-50 text-orange-700 border-orange-200',
  Managerial: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Panel: 'bg-violet-50 text-violet-700 border-violet-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200',

  // Status
  published: 'bg-green-50 text-green-700 border-green-200',
  review: 'bg-amber-100 text-amber-900 border-amber-300',
  draft: 'bg-slate-100 text-slate-600 border-slate-300',
};

export const Badge = ({ children, variant = 'Other', className = '' }) => {
  const style = typeStyles[variant] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {children}
    </span>
  );
};
