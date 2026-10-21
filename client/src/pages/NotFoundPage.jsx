import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Building2, BookOpen, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center py-16">
      {/* 404 Number */}
      <div className="relative mb-6">
        <span
          className="text-8xl sm:text-9xl font-extrabold select-none"
          style={{ color: '#eff6ff', WebkitTextStroke: '2px #bfdbfe' }}
          aria-hidden="true"
        >
          404
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
        The placement resource or page you're looking for doesn't exist or has been moved.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all hover:-translate-y-0.5"
        >
          <Building2 className="w-4 h-4" aria-hidden="true" />
          <span>Browse Companies</span>
        </Link>
        <Link
          to="/learning-material"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all hover:-translate-y-0.5"
        >
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          <span>View Resources</span>
        </Link>
      </div>
    </div>
  );
};
