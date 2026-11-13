const mongoose = require('mongoose');
const Visitor = require('../models/Visitor');
const VisitorSession = require('../models/VisitorSession');
const PageView = require('../models/PageView');
const UserEvent = require('../models/UserEvent');
const { parseUserAgent } = require('../utils/uaParser');
const { resolveLocation, getClientIp } = require('../utils/geoIpLookup');

/**
 * Helper: Parse referrer to extract domain/channel
 */
function parseReferrer(referrerUrl) {
  if (!referrerUrl || typeof referrerUrl !== 'string') return 'Direct';
  try {
    const url = new URL(referrerUrl);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host.includes('google')) return 'Google Search';
    if (host.includes('bing')) return 'Bing';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('github')) return 'GitHub';
    if (host.includes('twitter') || host.includes('x.com')) return 'X / Twitter';
    if (host.includes('facebook') || host.includes('instagram')) return 'Social Media';
    if (host.includes('whatsapp') || host.includes('t.me')) return 'Direct Messaging';
    return host || 'Direct';
  } catch (e) {
    return 'Direct';
  }
}

/**
 * Helper: Parse date range filter and its previous equivalent period
 */
function getDateRanges(range, customStart, customEnd) {
  const now = new Date();
  let start = new Date();
  let end = new Date(now);

  switch (range) {
    case 'today': {
      start.setHours(0, 0, 0, 0);
      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 1);
      const prevEnd = new Date(start);
      prevEnd.setMilliseconds(-1);
      return { start, end, prevStart, prevEnd };
    }
    case 'yesterday': {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 1);
      const prevEnd = new Date(end);
      prevEnd.setDate(prevEnd.getDate() - 1);
      return { start, end, prevStart, prevEnd };
    }
    case '7d': {
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      const duration = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - duration);
      const prevEnd = new Date(start.getTime() - 1);
      return { start, end, prevStart, prevEnd };
    }
    case '30d': {
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      const duration = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - duration);
      const prevEnd = new Date(start.getTime() - 1);
      return { start, end, prevStart, prevEnd };
    }
    case '90d': {
      start.setDate(start.getDate() - 90);
      start.setHours(0, 0, 0, 0);
      const duration = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - duration);
      const prevEnd = new Date(start.getTime() - 1);
      return { start, end, prevStart, prevEnd };
    }
    case 'this_month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end, prevStart, prevEnd };
    }
    case 'last_month': {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      const prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
      return { start, end, prevStart, prevEnd };
    }
    case 'custom': {
      if (customStart && customEnd) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        const duration = end.getTime() - start.getTime();
        const prevStart = new Date(start.getTime() - duration);
        const prevEnd = new Date(start.getTime() - 1);
        return { start, end, prevStart, prevEnd };
      }
      // Fallback to 7d
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      const prevStart = new Date(start.getTime() - 7 * 86400000);
      const prevEnd = new Date(start.getTime() - 1);
      return { start, end, prevStart, prevEnd };
    }
    default: {
      // Default to last 7 days
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      const duration = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - duration);
      const prevEnd = new Date(start.getTime() - 1);
      return { start, end, prevStart, prevEnd };
    }
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PUBLIC TELEMETRY ENDPOINTS
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Track page view and visitor activity event
 */
const trackEvent = async (req, res) => {
  try {
    const { visitorId, sessionId, pageUrl, pageTitle = '', referrer = '' } = req.body;
    const now = new Date();

    // 1. Detect IP and approximate Geolocation
    const geo = await resolveLocation(req);
    const ua = parseUserAgent(req.headers['user-agent']);
    const referrerDomain = parseReferrer(referrer);

    // 2. Prevent duplicate page view within last 2 seconds for this session & URL
    const recentDuplicate = await PageView.findOne({
      sessionId,
      pageUrl,
      enteredAt: { $gte: new Date(now.getTime() - 2000) },
    }).lean();

    if (!recentDuplicate) {
      await PageView.create({
        visitorId,
        sessionId,
        pageUrl,
        pageTitle,
        enteredAt: now,
        referrer,
      });
    }

    // 3. Upsert Visitor Record
    const existingVisitor = await Visitor.findOne({ visitorId });
    if (!existingVisitor) {
      await Visitor.create({
        visitorId,
        firstVisit: now,
        lastVisit: now,
        totalSessions: 1,
        totalPageViews: 1,
        isReturning: false,
        device: ua.device,
        browser: ua.browser,
        browserVersion: ua.browserVersion,
        os: ua.os,
        osVersion: ua.osVersion,
        ip: geo.ip,
        country: geo.country,
        state: geo.state,
        city: geo.city,
        lastSessionId: sessionId,
        lastPageUrl: pageUrl,
        userAgent: (req.headers['user-agent'] || '').substring(0, 300),
      });
    } else {
      const isNewSession = existingVisitor.lastSessionId !== sessionId;
      const updateData = {
        lastVisit: now,
        lastSessionId: sessionId,
        lastPageUrl: pageUrl,
        $inc: { totalPageViews: 1 },
      };
      if (isNewSession) {
        updateData.$inc.totalSessions = 1;
        updateData.isReturning = true;
      }
      // Update geo/IP if changed
      if (geo.ip && geo.ip !== existingVisitor.ip) {
        updateData.ip = geo.ip;
        updateData.country = geo.country;
        updateData.state = geo.state;
        updateData.city = geo.city;
      }
      await Visitor.updateOne({ visitorId }, updateData);
    }

    // 4. Upsert Session Record
    const existingSession = await VisitorSession.findOne({ sessionId });
    if (!existingSession) {
      await VisitorSession.create({
        sessionId,
        visitorId,
        startedAt: now,
        lastActivityAt: now,
        duration: 0,
        pageViewCount: 1,
        entryPage: pageUrl,
        exitPage: pageUrl,
        referrer,
        referrerDomain,
        isBounce: true,
        device: ua.device,
        browser: ua.browser,
        os: ua.os,
        country: geo.country,
        city: geo.city,
      });
    } else {
      const durationSeconds = Math.max(
        0,
        Math.round((now.getTime() - new Date(existingSession.startedAt).getTime()) / 1000)
      );
      await VisitorSession.updateOne(
        { sessionId },
        {
          lastActivityAt: now,
          exitPage: pageUrl,
          duration: durationSeconds,
          isBounce: false,
          $inc: { pageViewCount: 1 },
        }
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics event:', error.message);
    // Silent fail with 200 so visitor's browsing experience is never disturbed
    return res.status(200).json({ success: false, error: 'Tracking failed quietly' });
  }
};

/**
 * Lightweight periodic heartbeat ping to track real-time activity and session duration
 */
const heartbeat = async (req, res) => {
  try {
    const { visitorId, sessionId, pageUrl } = req.body;
    const now = new Date();

    const session = await VisitorSession.findOne({ sessionId });
    if (session) {
      const durationSeconds = Math.max(
        0,
        Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 1000)
      );
      await VisitorSession.updateOne(
        { sessionId },
        {
          lastActivityAt: now,
          duration: durationSeconds,
          ...(pageUrl ? { exitPage: pageUrl } : {}),
        }
      );
    }

    if (visitorId) {
      await Visitor.updateOne(
        { visitorId },
        {
          lastVisit: now,
          ...(pageUrl ? { lastPageUrl: pageUrl } : {}),
        }
      );
    }

    return res.status(200).json({ success: true, active: true });
  } catch (error) {
    return res.status(200).json({ success: false });
  }
};

/**
 * Handle beacon on page leave / unload
 */
const leavePage = async (req, res) => {
  try {
    const { visitorId, sessionId, pageUrl, timeSpent } = req.body;
    const now = new Date();

    // Update latest page view exit time
    if (sessionId && pageUrl) {
      const lastPv = await PageView.findOne({ sessionId, pageUrl }).sort({ enteredAt: -1 });
      if (lastPv) {
        const spent = Number(timeSpent) || Math.max(0, Math.round((now.getTime() - new Date(lastPv.enteredAt).getTime()) / 1000));
        await PageView.updateOne(
          { _id: lastPv._id },
          {
            exitedAt: now,
            timeSpent: spent,
          }
        );
      }
    }

    // Update session duration
    if (sessionId) {
      const session = await VisitorSession.findOne({ sessionId });
      if (session) {
        const totalDuration = Math.max(
          0,
          Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 1000)
        );
        await VisitorSession.updateOne(
          { sessionId },
          {
            lastActivityAt: now,
            endedAt: now,
            duration: totalDuration,
          }
        );
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(200).json({ success: false });
  }
};

/**
 * Track user interaction, search queries, code runs, and feature usage
 */
const trackUserEvent = async (req, res) => {
  try {
    const {
      visitorId,
      sessionId,
      eventType = 'general',
      category = 'general',
      action,
      metadata = {},
      pageUrl = '',
    } = req.body;

    if (!visitorId || !sessionId || !action) {
      return res.status(200).json({ success: false, message: 'Missing required event fields' });
    }

    const now = new Date();

    // Sanitize metadata
    const safeMetadata = { ...metadata };
    if (safeMetadata.query && typeof safeMetadata.query === 'string') {
      safeMetadata.query = safeMetadata.query.trim().substring(0, 150);
    }

    await UserEvent.create({
      visitorId,
      sessionId,
      eventType: eventType || 'general',
      category: category || 'general',
      action: action.substring(0, 100),
      metadata: safeMetadata,
      pageUrl: (pageUrl || '').substring(0, 300),
      timestamp: now,
    });

    // Touch session and visitor
    await Promise.all([
      VisitorSession.updateOne({ sessionId }, { lastActivityAt: now }).catch(() => {}),
      Visitor.updateOne({ visitorId }, { lastVisit: now }).catch(() => {}),
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking user event:', error.message);
    return res.status(200).json({ success: false });
  }
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ADMIN PROTECTED ANALYTICS ENDPOINTS
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Dashboard Overview Cards with Period-over-Period comparisons
 */
const getDashboardOverview = async (req, res) => {
  try {
    const { range = '7d', startDate, endDate } = req.query;
    const { start, end, prevStart, prevEnd } = getDateRanges(range, startDate, endDate);
    const activeThreshold = new Date(Date.now() - 5 * 60 * 1000); // active in last 5 minutes

    // ── CURRENT PERIOD METRICS ──
    const [
      totalSessions,
      uniqueVisitorsCount,
      totalPageViewsCount,
      activeVisitorsCount,
      newVisitorsCount,
      returningVisitorsCount,
      sessionMetrics,
    ] = await Promise.all([
      VisitorSession.countDocuments({ startedAt: { $gte: start, $lte: end } }),
      VisitorSession.distinct('visitorId', { startedAt: { $gte: start, $lte: end } }).then((res) => res.length),
      PageView.countDocuments({ enteredAt: { $gte: start, $lte: end } }),
      VisitorSession.distinct('visitorId', { lastActivityAt: { $gte: activeThreshold } }).then((res) => res.length),
      Visitor.countDocuments({ firstVisit: { $gte: start, $lte: end } }),
      VisitorSession.countDocuments({
        startedAt: { $gte: start, $lte: end },
        isBounce: false,
      }),
      VisitorSession.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$duration' },
            bounces: { $sum: { $cond: ['$isBounce', 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ]),
    ]);

    // ── PREVIOUS PERIOD METRICS (FOR PERCENTAGE DELTAS) ──
    const [
      prevSessions,
      prevUniqueVisitorsCount,
      prevPageViewsCount,
      prevSessionMetrics,
    ] = await Promise.all([
      VisitorSession.countDocuments({ startedAt: { $gte: prevStart, $lte: prevEnd } }),
      VisitorSession.distinct('visitorId', { startedAt: { $gte: prevStart, $lte: prevEnd } }).then((res) => res.length),
      PageView.countDocuments({ enteredAt: { $gte: prevStart, $lte: prevEnd } }),
      VisitorSession.aggregate([
        { $match: { startedAt: { $gte: prevStart, $lte: prevEnd } } },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$duration' },
            bounces: { $sum: { $cond: ['$isBounce', 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ]),
    ]);

    const currentAvgDuration = sessionMetrics[0]?.avgDuration ? Math.round(sessionMetrics[0].avgDuration) : 0;
    const currentBounceRate =
      sessionMetrics[0]?.total > 0
        ? Math.round((sessionMetrics[0].bounces / sessionMetrics[0].total) * 100)
        : 0;

    const prevAvgDuration = prevSessionMetrics[0]?.avgDuration ? Math.round(prevSessionMetrics[0].avgDuration) : 0;
    const prevBounceRate =
      prevSessionMetrics[0]?.total > 0
        ? Math.round((prevSessionMetrics[0].bounces / prevSessionMetrics[0].total) * 100)
        : 0;

    const calcDelta = (curr, prev) => {
      if (!prev || prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return res.status(200).json({
      success: true,
      data: {
        totalVisitors: {
          value: totalSessions,
          prevValue: prevSessions,
          change: calcDelta(totalSessions, prevSessions),
        },
        uniqueVisitors: {
          value: uniqueVisitorsCount,
          prevValue: prevUniqueVisitorsCount,
          change: calcDelta(uniqueVisitorsCount, prevUniqueVisitorsCount),
        },
        totalPageViews: {
          value: totalPageViewsCount,
          prevValue: prevPageViewsCount,
          change: calcDelta(totalPageViewsCount, prevPageViewsCount),
        },
        activeVisitors: {
          value: activeVisitorsCount,
        },
        newVisitors: {
          value: newVisitorsCount,
        },
        returningVisitors: {
          value: Math.max(0, uniqueVisitorsCount - newVisitorsCount),
        },
        avgSessionDuration: {
          value: currentAvgDuration,
          prevValue: prevAvgDuration,
          change: calcDelta(currentAvgDuration, prevAvgDuration),
        },
        bounceRate: {
          value: currentBounceRate,
          prevValue: prevBounceRate,
          change: currentBounceRate - prevBounceRate,
        },
        dateRange: {
          range,
          start,
          end,
          prevStart,
          prevEnd,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics' });
  }
};

/**
 * Traffic Trends (Time Series: Daily, Weekly, or Hourly)
 */
const getVisitorTrends = async (req, res) => {
  try {
    const { range = '7d', startDate, endDate } = req.query;
    const { start, end } = getDateRanges(range, startDate, endDate);

    const isHourly = range === 'today' || range === 'yesterday';

    let dateFormat;
    if (isHourly) {
      dateFormat = '%Y-%m-%d %H:00';
    } else {
      dateFormat = '%Y-%m-%d';
    }

    const [pageViewsSeries, sessionsSeries] = await Promise.all([
      PageView.aggregate([
        { $match: { enteredAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: '$enteredAt' } },
            pageViews: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
          },
        },
        {
          $project: {
            _id: 1,
            pageViews: 1,
            visitors: { $size: '$uniqueVisitors' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      VisitorSession.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: '$startedAt' } },
            sessions: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Merge series into continuous chronological timeline
    const sessionsMap = new Map();
    sessionsSeries.forEach((s) => sessionsMap.set(s._id, s.sessions));

    const merged = pageViewsSeries.map((item) => ({
      timestamp: item._id,
      label: isHourly ? item._id.split(' ')[1] : item._id,
      pageViews: item.pageViews,
      visitors: item.visitors,
      sessions: sessionsMap.get(item._id) || item.visitors,
    }));

    return res.status(200).json({
      success: true,
      data: {
        isHourly,
        points: merged,
      },
    });
  } catch (error) {
    console.error('Error fetching visitor trends:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch trends data' });
  }
};

/**
 * Top Visited Pages with Views, Unique Visitors, and Average Time Spent
 */
const getPageAnalytics = async (req, res) => {
  try {
    const { range = '7d', startDate, endDate, limit = 20 } = req.query;
    const { start, end } = getDateRanges(range, startDate, endDate);

    const pages = await PageView.aggregate([
      { $match: { enteredAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$pageUrl',
          pageTitle: { $first: '$pageTitle' },
          totalViews: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
          avgTimeSpent: { $avg: '$timeSpent' },
        },
      },
      {
        $project: {
          pageUrl: '$_id',
          pageTitle: { $ifNull: ['$pageTitle', '$_id'] },
          totalViews: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          avgTimeSpent: { $round: [{ $ifNull: ['$avgTimeSpent', 0] }, 0] },
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: parseInt(limit, 10) || 20 },
    ]);

    return res.status(200).json({ success: true, data: pages });
  } catch (error) {
    console.error('Error fetching page analytics:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch page analytics' });
  }
};

/**
 * Device, Browser, and Operating System Distributions
 */
const getDeviceStats = async (req, res) => {
  try {
    const { range = '7d', startDate, endDate } = req.query;
    const { start, end } = getDateRanges(range, startDate, endDate);

    const [devices, browsers, operatingSystems] = await Promise.all([
      VisitorSession.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $ifNull: ['$device', 'Desktop'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      VisitorSession.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $ifNull: ['$browser', 'Unknown'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      VisitorSession.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $ifNull: ['$os', 'Unknown'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        devices: devices.map((d) => ({ name: d._id, count: d.count })),
        browsers: browsers.map((b) => ({ name: b._id, count: b.count })),
        operatingSystems: operatingSystems.map((o) => ({ name: o._id, count: o.count })),
      },
    });
  } catch (error) {
    console.error('Error fetching device stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch device stats' });
  }
};

/**
 * Approximate Geographic Analytics (Country, State/Region, City)
 */
const getGeoStats = async (req, res) => {
  try {
    const { range = '7d', startDate, endDate } = req.query;
    const { start, end } = getDateRanges(range, startDate, endDate);

    const [countries, states, cities] = await Promise.all([
      VisitorSession.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $ifNull: ['$country', 'Unknown'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      VisitorSession.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $ifNull: ['$state', 'Unknown'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      VisitorSession.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: {
              city: { $ifNull: ['$city', 'Unknown'] },
              country: { $ifNull: ['$country', 'Unknown'] },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        countries: countries.map((c) => ({ name: c._id, count: c.count })),
        states: states.map((s) => ({ name: s._id, count: s.count })),
        cities: cities.map((c) => ({
          name: c._id.city,
          country: c._id.country,
          count: c.count,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching geo stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch geographic stats' });
  }
};

/**
 * Traffic Sources & Referrers Breakdown
 */
const getTrafficSources = async (req, res) => {
  try {
    const { range = '7d', startDate, endDate } = req.query;
    const { start, end } = getDateRanges(range, startDate, endDate);

    const sources = await VisitorSession.aggregate([
      { $match: { startedAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $ifNull: ['$referrerDomain', 'Direct'] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json({
      success: true,
      data: sources.map((s) => ({ name: s._id, count: s.count })),
    });
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch traffic sources' });
  }
};

/**
 * Real-time Active Visitors (Active in last 5 minutes)
 */
const getRealtimeVisitors = async (req, res) => {
  try {
    const activeThreshold = new Date(Date.now() - 5 * 60 * 1000);

    const activeSessions = await VisitorSession.find({
      lastActivityAt: { $gte: activeThreshold },
    })
      .sort({ lastActivityAt: -1 })
      .limit(50)
      .lean();

    const formatted = activeSessions.map((s) => {
      const activeSeconds = Math.round((Date.now() - new Date(s.lastActivityAt).getTime()) / 1000);
      return {
        sessionId: s.sessionId,
        visitorId: s.visitorId,
        currentPage: s.exitPage || s.entryPage || '/',
        device: s.device || 'Desktop',
        browser: s.browser || 'Unknown',
        location: `${s.city || 'Unknown'}, ${s.country || 'Unknown'}`,
        startedAt: s.startedAt,
        lastActivityAt: s.lastActivityAt,
        activeSeconds,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        activeCount: formatted.length,
        visitors: formatted,
      },
    });
  } catch (error) {
    console.error('Error fetching real-time visitors:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch realtime data' });
  }
};

/**
 * Paginated, searchable, sortable list of visitors
 */
const getVisitorsList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'lastVisit',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (search.trim()) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { visitorId: { $regex: escaped, $options: 'i' } },
        { ip: { $regex: escaped, $options: 'i' } },
        { city: { $regex: escaped, $options: 'i' } },
        { country: { $regex: escaped, $options: 'i' } },
        { browser: { $regex: escaped, $options: 'i' } },
        { os: { $regex: escaped, $options: 'i' } },
      ];
    }

    const sortDir = order === 'asc' ? 1 : -1;
    const sortObj = {};
    sortObj[sortBy] = sortDir;

    const [visitors, totalCount] = await Promise.all([
      Visitor.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Visitor.countDocuments(query),
    ]);

    const activeThreshold = new Date(Date.now() - 5 * 60 * 1000);
    const enriched = visitors.map((v) => ({
      ...v,
      isActive: new Date(v.lastVisit) >= activeThreshold,
    }));

    return res.status(200).json({
      success: true,
      data: {
        visitors: enriched,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching visitors list:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch visitors list' });
  }
};

/**
 * Detailed view of an individual visitor with full session history and page visits
 */
const getVisitorDetails = async (req, res) => {
  try {
    const { visitorId } = req.params;

    const visitor = await Visitor.findOne({ visitorId }).lean();
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    const [sessions, pageViews, events] = await Promise.all([
      VisitorSession.find({ visitorId }).sort({ startedAt: -1 }).limit(100).lean(),
      PageView.find({ visitorId }).sort({ enteredAt: -1 }).limit(100).lean(),
      UserEvent.find({ visitorId }).sort({ timestamp: -1 }).limit(50).lean(),
    ]);

    const activeThreshold = new Date(Date.now() - 5 * 60 * 1000);
    const isActive = new Date(visitor.lastVisit) >= activeThreshold;

    return res.status(200).json({
      success: true,
      data: {
        visitor: {
          ...visitor,
          isActive,
        },
        sessions,
        pageViews,
        events,
      },
    });
  } catch (error) {
    console.error('Error fetching visitor details:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch visitor details' });
  }
};

/**
 * Search Analytics: Queries, Frequency & Popular Categories
 */
const getSearchAnalytics = async (req, res) => {
  try {
    const { range = '7d', startDate, endDate } = req.query;
    const { start, end } = getDateRanges(range, startDate, endDate);

    const [topSearches, searchesByCategory, recentSearches] = await Promise.all([
      UserEvent.aggregate([
        {
          $match: {
            eventType: 'search',
            timestamp: { $gte: start, $lte: end },
            'metadata.query': { $exists: true, $nin: ['', null] },
          },
        },
        {
          $group: {
            _id: { $toLower: '$metadata.query' },
            count: { $sum: 1 },
            lastCategory: { $last: '$category' },
            latestAt: { $max: '$timestamp' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 25 },
        {
          $project: {
            query: '$_id',
            count: 1,
            category: '$lastCategory',
            latestAt: 1,
          },
        },
      ]),

      UserEvent.aggregate([
        {
          $match: {
            eventType: 'search',
            timestamp: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $ifNull: ['$category', 'companies'] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      UserEvent.find({
        eventType: 'search',
        timestamp: { $gte: start, $lte: end },
        'metadata.query': { $exists: true, $nin: ['', null] },
      })
        .sort({ timestamp: -1 })
        .limit(15)
        .select('metadata.query category pageUrl timestamp visitorId')
        .lean(),
    ]);

    const totalSearchCount = searchesByCategory.reduce((sum, item) => sum + item.count, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalSearches: totalSearchCount,
        topSearches,
        categories: searchesByCategory.map((c) => ({ name: c._id, count: c.count })),
        recentSearches: recentSearches.map((s) => ({
          query: s.metadata?.query,
          category: s.category,
          pageUrl: s.pageUrl,
          timestamp: s.timestamp,
        })),
      },
    });
  } catch (err) {
    console.error('Error fetching search analytics:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch search analytics' });
  }
};

/**
 * Feature & Practice Engagement Analytics
 */
const getFeatureEngagement = async (req, res) => {
  try {
    const { range = '7d', startDate, endDate } = req.query;
    const { start, end } = getDateRanges(range, startDate, endDate);

    const [
      practiceViews,
      codeExecutions,
      topTopics,
      topActions,
      resourceDownloads,
    ] = await Promise.all([
      UserEvent.countDocuments({
        eventType: 'practice_view',
        timestamp: { $gte: start, $lte: end },
      }),

      UserEvent.aggregate([
        {
          $match: {
            eventType: 'code_run',
            timestamp: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $ifNull: ['$metadata.language', 'javascript'] },
            totalRuns: { $sum: 1 },
            successCount: {
              $sum: {
                $cond: [{ $eq: ['$metadata.status', 'passed'] }, 1, 0],
              },
            },
          },
        },
        { $sort: { totalRuns: -1 } },
      ]),

      UserEvent.aggregate([
        {
          $match: {
            eventType: { $in: ['practice_view', 'code_run'] },
            timestamp: { $gte: start, $lte: end },
            'metadata.topic': { $exists: true, $nin: ['', null] },
          },
        },
        {
          $group: {
            _id: '$metadata.topic',
            views: { $sum: 1 },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),

      UserEvent.aggregate([
        {
          $match: {
            timestamp: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { category: '$category', action: '$action' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]),

      UserEvent.aggregate([
        {
          $match: {
            eventType: 'resource_download',
            timestamp: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $ifNull: ['$metadata.title', 'Learning Material'] },
            downloads: { $sum: 1 },
            category: { $last: '$category' },
          },
        },
        { $sort: { downloads: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const totalCodeRuns = codeExecutions.reduce((sum, item) => sum + item.totalRuns, 0);

    return res.status(200).json({
      success: true,
      data: {
        practiceViews,
        totalCodeRuns,
        codeExecutions: codeExecutions.map((c) => ({
          language: c._id,
          totalRuns: c.totalRuns,
          successCount: c.successCount,
        })),
        topTopics: topTopics.map((t) => ({ topic: t._id, views: t.views })),
        topActions: topActions.map((a) => ({
          category: a._id.category,
          action: a._id.action,
          count: a.count,
        })),
        resourceDownloads: resourceDownloads.map((r) => ({
          title: r._id,
          downloads: r.downloads,
          category: r.category,
        })),
      },
    });
  } catch (err) {
    console.error('Error fetching feature engagement:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch feature engagement' });
  }
};

/**
 * User Navigation Journeys (Entry, Exit & Flow Transitions)
 */
const getUserJourneys = async (req, res) => {
  try {
    const { range = '7d', startDate, endDate } = req.query;
    const { start, end } = getDateRanges(range, startDate, endDate);

    const [entryPages, exitPages, commonTransitions] = await Promise.all([
      VisitorSession.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$entryPage', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      VisitorSession.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$exitPage', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      VisitorSession.aggregate([
        {
          $match: {
            startedAt: { $gte: start, $lte: end },
            entryPage: { $ne: null },
            exitPage: { $ne: null },
          },
        },
        {
          $group: {
            _id: { from: '$entryPage', to: '$exitPage' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        entryPages: entryPages.map((e) => ({ page: e._id || '/', count: e.count })),
        exitPages: exitPages.map((e) => ({ page: e._id || '/', count: e.count })),
        transitions: commonTransitions.map((t) => ({
          from: t._id.from || '/',
          to: t._id.to || '/',
          count: t.count,
        })),
      },
    });
  } catch (err) {
    console.error('Error fetching user journeys:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user journeys' });
  }
};

/**
 * Export Analytics as CSV
 */
const exportAnalyticsCsv = async (req, res) => {
  try {
    const { range = '30d', type = 'sessions' } = req.query;
    const { start, end } = getDateRanges(range);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="gecr-analytics-${type}-${Date.now()}.csv"`
    );

    if (type === 'visitors') {
      res.write('Visitor ID,IP Address,Country,State,City,Device,Browser,OS,First Visit,Last Visit,Total Sessions,Total Page Views\n');
      const cursor = Visitor.find({ lastVisit: { $gte: start, $lte: end } }).cursor();
      for await (const doc of cursor) {
        const line = [
          `"${doc.visitorId}"`,
          `"${doc.ip || ''}"`,
          `"${doc.country || ''}"`,
          `"${doc.state || ''}"`,
          `"${doc.city || ''}"`,
          `"${doc.device || ''}"`,
          `"${doc.browser || ''}"`,
          `"${doc.os || ''}"`,
          `"${doc.firstVisit ? doc.firstVisit.toISOString() : ''}"`,
          `"${doc.lastVisit ? doc.lastVisit.toISOString() : ''}"`,
          doc.totalSessions || 1,
          doc.totalPageViews || 1,
        ].join(',');
        res.write(line + '\n');
      }
    } else if (type === 'pages') {
      res.write('Page URL,Page Title,Total Views,Unique Visitors,Avg Time Spent (sec)\n');
      const pages = await PageView.aggregate([
        { $match: { enteredAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: '$pageUrl',
            pageTitle: { $first: '$pageTitle' },
            totalViews: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
            avgTimeSpent: { $avg: '$timeSpent' },
          },
        },
        { $sort: { totalViews: -1 } },
      ]);
      pages.forEach((p) => {
        const line = [
          `"${p._id}"`,
          `"${(p.pageTitle || '').replace(/"/g, '""')}"`,
          p.totalViews,
          p.uniqueVisitors.length,
          Math.round(p.avgTimeSpent || 0),
        ].join(',');
        res.write(line + '\n');
      });
    } else {
      // Default: sessions
      res.write('Session ID,Visitor ID,Started At,Duration (sec),Page Views,Entry Page,Exit Page,Referrer,Device,Browser,OS,Country,City\n');
      const cursor = VisitorSession.find({ startedAt: { $gte: start, $lte: end } }).cursor();
      for await (const s of cursor) {
        const line = [
          `"${s.sessionId}"`,
          `"${s.visitorId}"`,
          `"${s.startedAt ? s.startedAt.toISOString() : ''}"`,
          s.duration || 0,
          s.pageViewCount || 1,
          `"${(s.entryPage || '').replace(/"/g, '""')}"`,
          `"${(s.exitPage || '').replace(/"/g, '""')}"`,
          `"${(s.referrerDomain || '').replace(/"/g, '""')}"`,
          `"${s.device || ''}"`,
          `"${s.browser || ''}"`,
          `"${s.os || ''}"`,
          `"${s.country || ''}"`,
          `"${s.city || ''}"`,
        ].join(',');
        res.write(line + '\n');
      }
    }

    res.end();
  } catch (error) {
    console.error('Error exporting analytics CSV:', error);
    return res.status(500).json({ success: false, message: 'Export failed' });
  }
};

/**
 * Data retention & GDPR/Privacy deletion endpoint
 */
const purgeVisitorData = async (req, res) => {
  try {
    const { visitorId, olderThanDays } = req.body;

    if (visitorId) {
      await Promise.all([
        Visitor.deleteOne({ visitorId }),
        VisitorSession.deleteMany({ visitorId }),
        PageView.deleteMany({ visitorId }),
        UserEvent.deleteMany({ visitorId }),
      ]);
      return res.status(200).json({
        success: true,
        message: `Successfully deleted all records for visitor ${visitorId}`,
      });
    }

    if (olderThanDays) {
      const days = parseInt(olderThanDays, 10);
      if (isNaN(days) || days < 7) {
        return res.status(400).json({
          success: false,
          message: 'olderThanDays must be at least 7 days',
        });
      }
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const [pRes, sRes, vRes, eRes] = await Promise.all([
        PageView.deleteMany({ enteredAt: { $lt: cutoff } }),
        VisitorSession.deleteMany({ startedAt: { $lt: cutoff } }),
        Visitor.deleteMany({ lastVisit: { $lt: cutoff } }),
        UserEvent.deleteMany({ timestamp: { $lt: cutoff } }),
      ]);

      return res.status(200).json({
        success: true,
        message: `Retention purge complete. Removed records older than ${days} days.`,
        data: {
          pageViewsDeleted: pRes.deletedCount,
          sessionsDeleted: sRes.deletedCount,
          visitorsDeleted: vRes.deletedCount,
          eventsDeleted: eRes.deletedCount,
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Either visitorId or olderThanDays must be specified',
    });
  } catch (error) {
    console.error('Error purging analytics data:', error);
    return res.status(500).json({ success: false, message: 'Purge failed' });
  }
};

module.exports = {
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
};

