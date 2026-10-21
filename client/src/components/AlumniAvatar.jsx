import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

/**
 * Reusable AlumniAvatar component.
 * Displays the verified alumnus profile photo when available.
 * If photo is not available or fails to load, cleanly falls back to a neutral,
 * professional person avatar placeholder with initials.
 * NEVER substitutes a company logo for a person's profile picture.
 */
export const AlumniAvatar = ({
  src,
  name = 'Alumnus',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImageError(false);
    setLoaded(false);
  }, [src]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  };

  const getInitials = (str) => {
    if (!str) return 'AL';
    const parts = str.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const initials = getInitials(name);
  const resolvedSrc = typeof src === 'string' && src.trim() ? src.trim() : null;

  return (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center rounded-full overflow-hidden border border-slate-200 bg-slate-100 text-slate-700 shadow-2xs ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      title={name}
    >
      {resolvedSrc && !imageError ? (
        <>
          <img
            src={resolvedSrc}
            alt={`${name} profile`}
            loading="lazy"
            onError={() => setImageError(true)}
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-150 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center font-bold tracking-wider bg-slate-100 text-slate-600">
              {initials}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold select-none">
          {initials ? (
            <span className="font-semibold text-slate-700 tracking-tight">{initials}</span>
          ) : (
            <User className={`${iconSizes[size] || iconSizes.md} text-slate-400`} />
          )}
        </div>
      )}
    </div>
  );
};
