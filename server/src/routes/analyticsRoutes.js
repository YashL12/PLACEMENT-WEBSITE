const express = require('express');
const router = express.Router();

const {
  trackEvent,
  trackUserEvent,
  heartbeat,
  leavePage,
  getDashboardOverview,
  getVisitorTrends,
  getPageAnalytics,
  getDeviceStats,
  getGeoStats,
  getTrafficSources,
  getRealtimeVisitors,
  getVisitorsList,
  getVisitorDetails,
  getSearchAnalytics,
  getFeatureEngagement,
  getUserJourneys,
  exportAnalyticsCsv,
  purgeVisitorData,
} = require('../controllers/analyticsController');

const { protect } = require('../middleware/auth');
const { analyticsTrackingLimiter } = require('../middleware/rateLimiter');
const {
  validateTrackEvent,
  validateHeartbeat,
  validateLeavePage,
} = require('../validators/analyticsValidator');

// ── Public Anonymous Tracking Endpoints (Throttled & Validated) ──────────────
router.post('/track', analyticsTrackingLimiter, validateTrackEvent, trackEvent);
router.post('/event', analyticsTrackingLimiter, trackUserEvent);
router.post('/heartbeat', analyticsTrackingLimiter, validateHeartbeat, heartbeat);
router.post('/leave', analyticsTrackingLimiter, validateLeavePage, leavePage);

// ── Admin Protected Analytics Endpoints ─────────────────────────────────────
router.get('/dashboard', protect, getDashboardOverview);
router.get('/trends', protect, getVisitorTrends);
router.get('/pages', protect, getPageAnalytics);
router.get('/devices', protect, getDeviceStats);
router.get('/geo', protect, getGeoStats);
router.get('/sources', protect, getTrafficSources);
router.get('/searches', protect, getSearchAnalytics);
router.get('/engagement', protect, getFeatureEngagement);
router.get('/journeys', protect, getUserJourneys);
router.get('/realtime', protect, getRealtimeVisitors);
router.get('/visitors', protect, getVisitorsList);
router.get('/visitors/:visitorId', protect, getVisitorDetails);
router.get('/export', protect, exportAnalyticsCsv);
router.post('/purge', protect, purgeVisitorData);

module.exports = router;

