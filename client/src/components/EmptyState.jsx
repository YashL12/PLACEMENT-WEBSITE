import React from 'react';
import { SearchX, Building2, AlertCircle } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No records found',
  description = 'Try adjusting your search query or removing active filters to see available placement data.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
