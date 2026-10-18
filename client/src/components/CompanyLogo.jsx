import React, { useState } from 'react';

/**
 * Reusable CompanyLogo component with aspect ratio preservation,
 * image error fallback, initials placeholder, and zero layout shift.
 */
export const CompanyLogo = ({
  src,
  name = 'Company',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Dimension presets
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const getInitials = (str) => {
    if (!str) return 'C';
    const clean = str.replace(/\[.*?\]/g, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  // Generate consistent subtle pastel background based on company name
  const getPlaceholderColor = (str) => {
    const palettes = [
      'bg-slate-100 text-slate-700 border-slate-200',
      'bg-blue-50 text-blue-800 border-blue-200',
      'bg-indigo-50 text-indigo-800 border-indigo-200',
      'bg-emerald-50 text-emerald-800 border-emerald-200',
      'bg-sky-50 text-sky-800 border-sky-200',
      'bg-teal-50 text-teal-800 border-teal-200',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palettes[Math.abs(hash) % palettes.length];
  };

  const placeholderStyle = getPlaceholderColor(name);

  return (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden border bg-white shadow-2xs ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {src && !imageError ? (
        <>
          <img
            src={src}
            alt={`${name} official logo`}
            loading="lazy"
            onError={() => setImageError(true)}
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-contain p-1.5 transition-opacity duration-200 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {!loaded && (
            <div className={`absolute inset-0 flex items-center justify-center font-bold tracking-wider ${placeholderStyle}`}>
              {initials}
            </div>
          )}
        </>
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-bold tracking-wider select-none ${placeholderStyle}`}
          title={name}
        >
          {initials}
        </div>
      )}
    </div>
  );
};
