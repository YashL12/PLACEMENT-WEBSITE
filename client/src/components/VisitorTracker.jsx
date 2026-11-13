import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { tracker } from '../services/tracker';

export const VisitorTracker = () => {
  const location = useLocation();
  const currentUrlRef = useRef('');

  useEffect(() => {
    const fullUrl = location.pathname + location.search;

    // Do not track admin-facing routes to prevent skewing visitor metrics
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    currentUrlRef.current = fullUrl;

    // Wait for title update on next tick
    const timer = setTimeout(() => {
      tracker.trackPageView(fullUrl, document.title);
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname, location.search]);

  // Periodic Heartbeat & Page Unload Listeners
  useEffect(() => {
    // Only run if not on admin page
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // Heartbeat every 25 seconds if tab is active and visible
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && currentUrlRef.current) {
        tracker.sendHeartbeat(currentUrlRef.current);
      }
    }, 25000);

    // Unload / visibility change handler
    const handleUnload = () => {
      if (currentUrlRef.current) {
        tracker.trackPageLeave(currentUrlRef.current);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && currentUrlRef.current) {
        tracker.trackPageLeave(currentUrlRef.current);
      }
    };

    // Automatic declarative click tracking
    const handleClick = (e) => {
      const target = e.target.closest && e.target.closest('[data-track-click], [data-track-feature]');
      if (target) {
        const action = target.getAttribute('data-track-click') || target.getAttribute('data-track-feature');
        const category = target.getAttribute('data-track-category') || 'ui';
        const label = target.getAttribute('data-track-label') || target.innerText?.trim()?.slice(0, 50) || '';
        tracker.trackFeatureClick(action, category, { label });
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', handleClick, { passive: true });

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleClick);
    };
  }, [location.pathname]);

  return null;
};

export default VisitorTracker;

