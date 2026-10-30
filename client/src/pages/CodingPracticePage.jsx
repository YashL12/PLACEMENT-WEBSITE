// CodingPracticePage — kept for backwards compatibility
// Redirects to the new /practice hub page
import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

export const CodingPracticePage = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  if (category === 'DSA') return <Navigate to="/practice/dsa" replace />;
  if (category === 'SQL') return <Navigate to="/practice/sql" replace />;

  return <Navigate to="/practice" replace />;
};
