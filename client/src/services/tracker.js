/**
 * Anonymous Visitor & Telemetry Tracking Service
 * Lightweight, non-blocking, privacy-preserving client tracker.
 * Automatically collects first-party telemetry without repetitive blocking modals.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const VISITOR_ID_KEY = 'gecr_visitor_id';
const SESSION_ID_KEY = 'gecr_session_id';
const SESSION_ACTIVITY_KEY = 'gecr_session_last_activity';
const CONSENT_KEY = 'gecr_analytics_consent';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a cryptographically random, collision-resistant identifier
 */
function generateId(prefix = 'v') {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 12);
  const cryptoPart =
    typeof crypto !== 'undefined' && crypto.getRandomValues
      ? Array.from(crypto.getRandomValues(new Uint8Array(4)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      : Math.random().toString(36).substring(2, 8);

  return `${prefix}_${timestamp}_${randomPart}${cryptoPart}`;
}

/**
 * Get or create persistent anonymous Visitor ID
 */
export function getVisitorId() {
  try {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = generateId('v');
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  } catch (e) {
    return generateId('v_tmp');
  }
}

/**
 * Get or create current Session ID with 30-min timeout reset
 */
export function getSessionId() {
  try {
    const now = Date.now();
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    const lastActivity = parseInt(sessionStorage.getItem(SESSION_ACTIVITY_KEY) || '0', 10);

    if (!sessionId || now - lastActivity > SESSION_TIMEOUT_MS) {
      sessionId = generateId('s');
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    sessionStorage.setItem(SESSION_ACTIVITY_KEY, now.toString());
    return sessionId;
  } catch (e) {
    return generateId('s_tmp');
  }
}

/**
 * Check if visitor has explicitly declined telemetry
 * Ordinary first-party analytics is enabled by default unless user opted out
 */
export function hasConsent() {
  try {
    const consent = localStorage.getItem(CONSENT_KEY);
    return consent !== 'declined';
  } catch (e) {
    return true;
  }
}

/**
 * Set visitor consent preference
 */
export function setConsent(consented) {
  try {
    localStorage.setItem(CONSENT_KEY, consented ? 'accepted' : 'declined');
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Non-blocking send beacon / fetch helper
 */
function sendPayload(endpoint, payload, useBeacon = false) {
  if (!hasConsent()) return;

  const url = `${API_BASE_URL}${endpoint}`;
  const data = JSON.stringify(payload);

  if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) return;
    } catch (e) {
      // Beacon failed, fallback to fetch keepalive
    }
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
    keepalive: true,
  }).catch(() => {
    // Fail silently so visitor experience is never interrupted
  });
}

// Track state in-memory to prevent duplicate emissions
let lastTrackedUrl = null;
let lastTrackedTime = 0;
let pageEnteredTime = Date.now();
const recentSearchesMap = new Map();

export const tracker = {
  /**
   * Track a page view
   */
  trackPageView(url, title = document.title) {
    const now = Date.now();
    if (lastTrackedUrl === url && now - lastTrackedTime < 600) {
      return;
    }

    lastTrackedUrl = url;
    lastTrackedTime = now;
    pageEnteredTime = now;

    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const referrer = document.referrer || '';

    sendPayload('/analytics/track', {
      visitorId,
      sessionId,
      pageUrl: url,
      pageTitle: title,
      referrer,
    });
  },

  /**
   * Track specific user events (searches, button clicks, code runs, etc.)
   */
  trackEvent(eventType, category, action, metadata = {}, pageUrl = null) {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const currentUrl = pageUrl || (typeof window !== 'undefined' ? window.location.pathname : '');

    sendPayload('/analytics/event', {
      visitorId,
      sessionId,
      eventType,
      category,
      action,
      metadata,
      pageUrl: currentUrl,
    });
  },

  /**
   * Track search queries with 1.5s debounce deduplication
   */
  trackSearch(query, section = 'general', resultsCount = 0) {
    if (!query || typeof query !== 'string') return;
    const clean = query.trim();
    if (clean.length < 2) return;

    const now = Date.now();
    const key = `${section}:${clean.toLowerCase()}`;
    if (recentSearchesMap.has(key) && now - recentSearchesMap.get(key) < 2500) {
      return;
    }
    recentSearchesMap.set(key, now);

    this.trackEvent('search', section, 'search_query', {
      query: clean,
      section,
      resultsCount,
    });
  },

  /**
   * Track practice problem viewed
   */
  trackPracticeView(slug, title, category = 'DSA', difficulty = 'Medium') {
    this.trackEvent('practice_view', category.toLowerCase(), 'view_question', {
      slug,
      title,
      category,
      difficulty,
    });
  },

  /**
   * Track code execution event
   */
  trackCodeRun(slug, language, status = 'executed') {
    this.trackEvent('code_run', 'practice', 'run_code', {
      slug,
      language,
      status,
    });
  },

  /**
   * Track study material download
   */
  trackDownload(title, category = 'General', fileType = 'PDF') {
    this.trackEvent('resource_download', 'resources', 'download_material', {
      title,
      category,
      fileType,
    });
  },

  /**
   * Track feature interaction click
   */
  trackFeatureClick(featureName, category = 'general', metadata = {}) {
    this.trackEvent('feature_click', category, featureName, metadata);
  },

  /**
   * Send periodic heartbeat ping
   */
  sendHeartbeat(url) {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();

    sendPayload('/analytics/heartbeat', {
      visitorId,
      sessionId,
      pageUrl: url,
    });
  },

  /**
   * Notify page leave / unload
   */
  trackPageLeave(url) {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const timeSpent = Math.max(0, Math.round((Date.now() - pageEnteredTime) / 1000));

    sendPayload(
      '/analytics/leave',
      {
        visitorId,
        sessionId,
        pageUrl: url,
        timeSpent,
      },
      true // use navigator.sendBeacon
    );
  },
};

export default tracker;
