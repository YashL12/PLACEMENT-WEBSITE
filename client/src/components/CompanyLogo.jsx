import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

// Global memory cache for image loading status across components
const loadedImagesCache = new Set();
const failedImagesCache = new Set();

/**
 * Reusable CompanyLogo component with aspect ratio preservation (object-fit: contain),
 * reliable fallback for missing/broken logos, in-memory caching to prevent flash,
 * and elegant monogram badges.
 */
export const CompanyLogo = ({
  src,
  name = 'Company',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
}) => {
  const resolvedSrc = typeof src === 'string' && src.trim() ? src.trim() : null;

  // Initialize with cached state if available
  const [imageError, setImageError] = useState(() => (resolvedSrc ? failedImagesCache.has(resolvedSrc) : true));
  const [loaded, setLoaded] = useState(() => (resolvedSrc ? loadedImagesCache.has(resolvedSrc) : false));

  useEffect(() => {
    if (!resolvedSrc) {
      setImageError(true);
      setLoaded(false);
      return;
    }
    if (failedImagesCache.has(resolvedSrc)) {
      setImageError(true);
      setLoaded(false);
      return;
    }
    if (loadedImagesCache.has(resolvedSrc)) {
      setImageError(false);
      setLoaded(true);
      return;
    }

    setImageError(false);
    setLoaded(false);
  }, [resolvedSrc]);

  const handleLoad = () => {
    if (resolvedSrc) {
      loadedImagesCache.add(resolvedSrc);
    }
    setLoaded(true);
    setImageError(false);
  };

  const handleError = () => {
    if (resolvedSrc) {
      failedImagesCache.add(resolvedSrc);
    }
    setImageError(true);
    setLoaded(false);
  };

  // Dimension presets with consistent aspect ratio
  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
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

  // Curated elegant color palettes matching the light professional theme
  const getPlaceholderColor = (str) => {
    const palettes = [
      'bg-blue-50 text-blue-700 border-blue-200/80',
      'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      'bg-sky-50 text-sky-700 border-sky-200/80',
      'bg-slate-50 text-slate-700 border-slate-200',
      'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    ];
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palettes[Math.abs(hash) % palettes.length];
  };

  const placeholderStyle = getPlaceholderColor(name);

  return (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden border bg-white shadow-2xs transition-all duration-150 ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={name}
    >
      {resolvedSrc && !imageError ? (
        <>
          <img
            src={resolvedSrc}
            alt={`${name} official logo`}
            loading="lazy"
            decoding="async"
            onError={handleError}
            onLoad={handleLoad}
            className={`w-full h-full object-contain p-1.5 select-none transition-opacity duration-150 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {!loaded && (
            <div className={`absolute inset-0 flex items-center justify-center font-bold tracking-wider select-none ${placeholderStyle}`}>
              {initials}
            </div>
          )}
        </>
      ) : (
        <div
          className={`w-full h-full flex flex-col items-center justify-center font-bold tracking-wider select-none border ${placeholderStyle}`}
        >
          <span>{initials}</span>
        </div>
      )}
    </div>
  );
};
