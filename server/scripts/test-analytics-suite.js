/**
 * Comprehensive Unit & Integration Test Suite for Visitor Analytics System
 * Tests uaParser, geoIpLookup, analyticsValidator, analyticsController, and route protections
 */

const assert = require('assert');
const jwt = require('jsonwebtoken');

const { parseUserAgent } = require('../src/utils/uaParser');
const { getClientIp, isPrivateIp, resolveLocation } = require('../src/utils/geoIpLookup');
const {
  validateTrackEvent,
  validateHeartbeat,
  validateLeavePage,
} = require('../src/validators/analyticsValidator');
const analyticsController = require('../src/controllers/analyticsController');
const Visitor = require('../src/models/Visitor');
const VisitorSession = require('../src/models/VisitorSession');
const PageView = require('../src/models/PageView');
const Admin = require('../src/models/Admin');
const { protect } = require('../src/middleware/auth');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`\x1b[32mPASS:\x1b[0m ${name}`);
    passed++;
  } catch (err) {
    console.error(`\x1b[31mFAIL:\x1b[0m ${name}`);
    console.error(`      ${err.message}`);
    failed++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`\x1b[32mPASS:\x1b[0m ${name}`);
    passed++;
  } catch (err) {
    console.error(`\x1b[31mFAIL:\x1b[0m ${name}`);
    console.error(`      ${err.message}`);
    failed++;
  }
}

// ── Mock Helper for Express Request / Response ──
function createMockReqRes({ body = {}, headers = {}, query = {}, params = {}, ip = '127.0.0.1' } = {}) {
  const req = {
    body,
    headers: { host: 'localhost', ...headers },
    query,
    params,
    ip,
    socket: { remoteAddress: ip },
  };

  let statusCode = 200;
  let responseData = null;
  const resHeaders = {};

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    setHeader(key, val) {
      resHeaders[key.toLowerCase()] = val;
    },
    getHeader(key) {
      return resHeaders[key.toLowerCase()];
    },
    write(chunk) {
      if (!this._written) this._written = '';
      this._written += chunk;
    },
    end(chunk) {
      if (chunk) this.write(chunk);
    },
    getStatusCode() {
      return statusCode;
    },
    getResponseData() {
      return responseData;
    },
    getWritten() {
      return this._written || '';
    },
  };

  return { req, res };
}

async function runAllTests() {
  console.log('====================================================');
  console.log('STARTING VISITOR ANALYTICS TEST SUITE');
  console.log('====================================================\n');

  // ── 1. USER-AGENT PARSER TESTS ──
  console.log('--- 1. Testing User-Agent Parser ---');
  test('Parses Windows 10/11 Desktop with Chrome', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    const res = parseUserAgent(ua);
    assert.strictEqual(res.browser, 'Chrome');
    assert.strictEqual(res.device, 'Desktop');
    assert.strictEqual(res.os, 'Windows 10/11');
  });

  test('Parses iPhone Safari as Mobile and iOS', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1';
    const res = parseUserAgent(ua);
    assert.strictEqual(res.browser, 'Safari');
    assert.strictEqual(res.device, 'Mobile');
    assert.strictEqual(res.os, 'iOS');
  });

  test('Parses iPad Safari as Tablet and iPadOS', () => {
    const ua =
      'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1';
    const res = parseUserAgent(ua);
    assert.strictEqual(res.browser, 'Safari');
    assert.strictEqual(res.device, 'Tablet');
    assert.strictEqual(res.os, 'iPadOS');
  });

  test('Parses Android Mobile with Edge', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36 EdgA/122.0.2365.68';
    const res = parseUserAgent(ua);
    assert.strictEqual(res.browser, 'Edge');
    assert.strictEqual(res.device, 'Mobile');
    assert.strictEqual(res.os, 'Android');
  });

  test('Handles empty/malformed User-Agent gracefully', () => {
    const res = parseUserAgent(null);
    assert.strictEqual(res.browser, 'Unknown');
    assert.strictEqual(res.device, 'Desktop');
    assert.strictEqual(res.os, 'Unknown');
  });

  // ── 2. IP & GEOLOCATION TESTS ──
  console.log('\n--- 2. Testing IP & Geolocation Resolution ---');
  test('Identifies local and private IP addresses correctly', () => {
    assert.strictEqual(isPrivateIp('127.0.0.1'), true);
    assert.strictEqual(isPrivateIp('::1'), true);
    assert.strictEqual(isPrivateIp('192.168.1.100'), true);
    assert.strictEqual(isPrivateIp('10.0.5.20'), true);
    assert.strictEqual(isPrivateIp('172.16.0.1'), true);
    assert.strictEqual(isPrivateIp('203.0.113.195'), false);
  });

  test('Normalizes IPv6-mapped IPv4 addresses', () => {
    const req = { ip: '::ffff:192.168.1.5' };
    assert.strictEqual(getClientIp(req), '192.168.1.5');
  });

  await testAsync('Resolves Edge / Vercel geolocation headers directly', async () => {
    const req = {
      ip: '203.0.113.50',
      headers: {
        'x-vercel-ip-country': 'IN',
        'x-vercel-ip-country-region': 'Gujarat',
        'x-vercel-ip-city': 'Raipur',
      },
    };
    const geo = await resolveLocation(req);
    assert.strictEqual(geo.country, 'IN');
    assert.strictEqual(geo.state, 'Gujarat');
    assert.strictEqual(geo.city, 'Raipur');
  });

  await testAsync('Resolves Localhost to Intranet without network calls', async () => {
    const req = { ip: '127.0.0.1', headers: {} };
    const geo = await resolveLocation(req);
    assert.strictEqual(geo.country, 'Local Network');
    assert.strictEqual(geo.city, 'Development / Intranet');
  });

  // ── 3. VALIDATION MIDDLEWARE TESTS ──
  console.log('\n--- 3. Testing Analytics Payload Validation ---');
  await testAsync('Rejects empty visitorId and sessionId', async () => {
    const { req, res } = createMockReqRes({
      body: { visitorId: '', sessionId: '', pageUrl: '/practice' },
    });
    let nextCalled = false;
    for (const middleware of validateTrackEvent) {
      await new Promise((resolve) => {
        middleware(req, res, () => {
          nextCalled = true;
          resolve();
        });
        if (res.getStatusCode() === 400) resolve();
      });
      if (res.getStatusCode() === 400) break;
    }
    assert.strictEqual(res.getStatusCode(), 400);
    assert.strictEqual(res.getResponseData()?.success, false);
  });

  await testAsync('Accepts valid telemetry tracking payload', async () => {
    const { req, res } = createMockReqRes({
      body: {
        visitorId: 'v_test_valid_123',
        sessionId: 's_test_valid_123',
        pageUrl: '/companies',
        pageTitle: 'Recruiting Companies',
      },
    });
    let nextCalled = false;
    for (const middleware of validateTrackEvent) {
      await new Promise((resolve) => {
        middleware(req, res, () => {
          nextCalled = true;
          resolve();
        });
      });
    }
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.getStatusCode(), 200);
  });

  // ── 4. SECURITY & AUTHENTICATION GATES ──
  console.log('\n--- 4. Testing Admin Route Authentication Protection ---');
  await testAsync('Rejects unauthenticated requests with 401', async () => {
    const { req, res } = createMockReqRes({ headers: {} });
    await protect(req, res, () => {});
    assert.strictEqual(res.getStatusCode(), 401);
    assert.strictEqual(res.getResponseData()?.success, false);
  });

  await testAsync('Rejects malformed JWT tokens with 401', async () => {
    const { req, res } = createMockReqRes({
      headers: { authorization: 'Bearer invalid.token.signature' },
    });
    await protect(req, res, () => {});
    assert.strictEqual(res.getStatusCode(), 401);
    assert.strictEqual(res.getResponseData()?.success, false);
  });

  // ── 5. CONTROLLER LOGIC & AGGREGATION PIPELINES ──
  console.log('\n--- 5. Testing Controller Aggregations & Endpoints ---');

  test('Validates Visitor, VisitorSession, PageView schema definition', () => {
    assert.ok(Visitor.schema.path('visitorId'), 'Visitor has visitorId index');
    assert.ok(Visitor.schema.path('isReturning'), 'Visitor has isReturning field');
    assert.ok(VisitorSession.schema.path('sessionId'), 'VisitorSession has sessionId');
    assert.ok(VisitorSession.schema.path('isBounce'), 'VisitorSession has isBounce');
    assert.ok(PageView.schema.path('pageUrl'), 'PageView has pageUrl');
  });

  await testAsync('Analytics leavePage records dwell duration with model stubs', async () => {
    // Stub model queries for isolated controller testing
    const origFindOne = PageView.findOne;
    const origUpdateOne = PageView.updateOne;
    const origSessionFindOne = VisitorSession.findOne;
    const origSessionUpdateOne = VisitorSession.updateOne;

    PageView.findOne = () => ({
      sort: () => Promise.resolve({ _id: 'pv123', enteredAt: new Date(Date.now() - 45000) }),
    });
    PageView.updateOne = () => Promise.resolve({ modifiedCount: 1 });
    VisitorSession.findOne = () =>
      Promise.resolve({
        startedAt: new Date(Date.now() - 120000),
      });
    VisitorSession.updateOne = () => Promise.resolve({ modifiedCount: 1 });

    const { req, res } = createMockReqRes({
      body: {
        visitorId: 'v_sample',
        sessionId: 's_sample',
        pageUrl: '/practice/sql',
        timeSpent: 45,
      },
    });

    await analyticsController.leavePage(req, res);

    // Restore stubs
    PageView.findOne = origFindOne;
    PageView.updateOne = origUpdateOne;
    VisitorSession.findOne = origSessionFindOne;
    VisitorSession.updateOne = origSessionUpdateOne;

    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(res.getResponseData()?.success, true);
  });

  await testAsync('Analytics heartbeat pings acknowledge session active state', async () => {
    const origSessionFindOne = VisitorSession.findOne;
    const origSessionUpdateOne = VisitorSession.updateOne;
    const origVisitorUpdateOne = Visitor.updateOne;

    VisitorSession.findOne = () =>
      Promise.resolve({
        startedAt: new Date(Date.now() - 60000),
      });
    VisitorSession.updateOne = () => Promise.resolve({ modifiedCount: 1 });
    Visitor.updateOne = () => Promise.resolve({ modifiedCount: 1 });

    const { req, res } = createMockReqRes({
      body: {
        visitorId: 'v_sample',
        sessionId: 's_sample',
        pageUrl: '/practice/sql',
      },
    });

    await analyticsController.heartbeat(req, res);

    VisitorSession.findOne = origSessionFindOne;
    VisitorSession.updateOne = origSessionUpdateOne;
    Visitor.updateOne = origVisitorUpdateOne;

    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(res.getResponseData()?.active, true);
  });

  await testAsync('Analytics trackEvent tracks pageview and handles returning visitor', async () => {
    const origPvFindOne = PageView.findOne;
    const origPvCreate = PageView.create;
    const origVisitorFindOne = Visitor.findOne;
    const origVisitorUpdate = Visitor.updateOne;
    const origSessionFindOne = VisitorSession.findOne;
    const origSessionUpdate = VisitorSession.updateOne;

    PageView.findOne = () => ({ lean: () => Promise.resolve(null) });
    PageView.create = (doc) => Promise.resolve(doc);
    Visitor.findOne = () =>
      Promise.resolve({
        visitorId: 'v_existing',
        lastSessionId: 's_old',
        ip: '127.0.0.1',
      });
    Visitor.updateOne = () => Promise.resolve({ modifiedCount: 1 });
    VisitorSession.findOne = () => Promise.resolve(null);
    VisitorSession.create = (doc) => Promise.resolve(doc);

    const { req, res } = createMockReqRes({
      body: {
        visitorId: 'v_existing',
        sessionId: 's_new',
        pageUrl: '/companies/google',
        pageTitle: 'Google Interview Experience',
        referrer: 'https://www.google.com',
      },
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    await analyticsController.trackEvent(req, res);

    PageView.findOne = origPvFindOne;
    PageView.create = origPvCreate;
    Visitor.findOne = origVisitorFindOne;
    Visitor.updateOne = origVisitorUpdate;
    VisitorSession.findOne = origSessionFindOne;
    VisitorSession.create = origSessionUpdate;

    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(res.getResponseData()?.success, true);
  });

  await testAsync('CSV export sets appropriate headers and format', async () => {
    const origCursor = PageView.aggregate;
    PageView.aggregate = () =>
      Promise.resolve([
        {
          _id: '/practice/dsa',
          pageTitle: 'DSA Practice',
          totalViews: 42,
          uniqueVisitors: ['v1', 'v2'],
          avgTimeSpent: 120,
        },
      ]);

    const { req, res } = createMockReqRes({
      query: { range: '7d', type: 'pages' },
    });
    await analyticsController.exportAnalyticsCsv(req, res);

    PageView.aggregate = origCursor;

    assert.strictEqual(res.getHeader('content-type'), 'text/csv');
    assert.ok(
      res.getHeader('content-disposition').includes('.csv'),
      'Content-Disposition contains .csv attachment'
    );
    assert.ok(
      res.getWritten().includes('Page URL,Page Title,Total Views'),
      'CSV header written correctly'
    );
    assert.ok(
      res.getWritten().includes('"/practice/dsa"'),
      'CSV body contains page data'
    );
  });

  await testAsync('Purge endpoint enforces minimum 7-day retention safety limit', async () => {
    const { req, res } = createMockReqRes({
      body: { olderThanDays: 3 }, // too low (less than 7)
    });
    await analyticsController.purgeVisitorData(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
    assert.ok(res.getResponseData()?.message.includes('at least 7 days'));
  });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
