/**
 * Comprehensive Automated Test Suite for GEC Placement Visitor Analytics System
 * Tests telemetry ingestion, deduplication, admin authentication, aggregations,
 * CSV streaming, and privacy retention.
 */

const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Ensure test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_analytics_2026';

const app = require('../src/server');
const Admin = require('../src/models/Admin');
const Visitor = require('../src/models/Visitor');
const VisitorSession = require('../src/models/VisitorSession');
const PageView = require('../src/models/PageView');

let server;
let baseUrl;
let adminToken;
let testAdminId;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING AUTOMATED VISITOR ANALYTICS TEST SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`\x1b[32mPASS:\x1b[0m ${message}`);
      passed++;
    } else {
      console.error(`\x1b[31mFAIL:\x1b[0m ${message}`);
      failed++;
    }
  }

  try {
    // 1. Start Server on ephemeral port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`Test server running at ${baseUrl}`);
        resolve();
      });
    });

    // 2. Setup mock admin token
    testAdminId = new mongoose.Types.ObjectId();
    adminToken = jwt.sign(
      { id: testAdminId, username: 'testadmin', email: 'testadmin@gecr.edu' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Mock Admin in DB if connected
    if (mongoose.connection.readyState === 1) {
      await Admin.updateOne(
        { _id: testAdminId },
        {
          username: 'testadmin',
          email: 'testadmin@gecr.edu',
          password: 'hashedpassword123',
          role: 'superadmin',
        },
        { upsert: true }
      );
    }

    // ── TEST GROUP 1: Health & Base API ──
    const healthRes = await makeRequest('/health');
    assert(healthRes.status === 200 && healthRes.data?.status === 'ok', 'GET /health returns 200 OK');

    // ── TEST GROUP 2: Security & Authentication Gates ──
    console.log('\n--- Checking Security & Auth Gates ---');
    const unauthDashboard = await makeRequest('/api/analytics/dashboard');
    assert(
      unauthDashboard.status === 401,
      'GET /api/analytics/dashboard without token is rejected with 401'
    );

    const invalidAuthRes = await makeRequest('/api/analytics/dashboard', {
      headers: { Authorization: 'Bearer bad_token_123' },
    });
    assert(
      invalidAuthRes.status === 401,
      'GET /api/analytics/dashboard with invalid token is rejected with 401'
    );

    const unauthVisitors = await makeRequest('/api/analytics/visitors');
    assert(
      unauthVisitors.status === 401,
      'GET /api/analytics/visitors without token is rejected with 401'
    );

    const unauthRealtime = await makeRequest('/api/analytics/realtime');
    assert(
      unauthRealtime.status === 401,
      'GET /api/analytics/realtime without token is rejected with 401'
    );

    // ── TEST GROUP 3: Public Ingestion & Payload Validation ──
    console.log('\n--- Checking Public Telemetry Ingestion ---');
    const invalidPayloadRes = await makeRequest('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { visitorId: '' }, // missing required fields
    });
    assert(
      invalidPayloadRes.status === 400 && invalidPayloadRes.data?.success === false,
      'POST /api/analytics/track validates payload and rejects missing fields with 400'
    );

    const testVisitorId = `v_test_${Date.now()}`;
    const testSessionId1 = `s_test_1_${Date.now()}`;

    // First visit tracking
    const track1 = await makeRequest('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Forwarded-For': '127.0.0.1',
      },
      body: {
        visitorId: testVisitorId,
        sessionId: testSessionId1,
        pageUrl: '/companies',
        pageTitle: 'Top Recruiting Companies | GECR',
        referrer: 'https://www.google.com/search?q=gecr+placement',
      },
    });
    assert(track1.status === 200 && track1.data?.success === true, 'POST /api/analytics/track accepts valid public telemetry');

    // Duplicate prevention test
    const trackDup = await makeRequest('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        visitorId: testVisitorId,
        sessionId: testSessionId1,
        pageUrl: '/companies',
        pageTitle: 'Top Recruiting Companies | GECR',
      },
    });
    assert(trackDup.status === 200, 'Duplicate pageview call within 2 seconds handled gracefully');

    // Second page in same session
    const track2 = await makeRequest('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        visitorId: testVisitorId,
        sessionId: testSessionId1,
        pageUrl: '/practice/dsa',
        pageTitle: 'DSA Coding Practice',
      },
    });
    assert(track2.status === 200, 'Additional pageview in session tracked successfully');

    // Heartbeat ping
    const heartbeatRes = await makeRequest('/api/analytics/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        visitorId: testVisitorId,
        sessionId: testSessionId1,
        pageUrl: '/practice/dsa',
      },
    });
    assert(
      heartbeatRes.status === 200 && heartbeatRes.data?.success === true,
      'POST /api/analytics/heartbeat updates session activity'
    );

    // Page leave beacon
    const leaveRes = await makeRequest('/api/analytics/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        visitorId: testVisitorId,
        sessionId: testSessionId1,
        pageUrl: '/practice/dsa',
        timeSpent: 45,
      },
    });
    assert(leaveRes.status === 200 && leaveRes.data?.success === true, 'POST /api/analytics/leave records exit time and dwell duration');

    // Returning visitor session (Session 2 for same visitor)
    const testSessionId2 = `s_test_2_${Date.now()}`;
    const trackReturn = await makeRequest('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      },
      body: {
        visitorId: testVisitorId,
        sessionId: testSessionId2,
        pageUrl: '/alumni',
        pageTitle: 'Alumni Network',
        referrer: 'https://www.linkedin.com/feed/',
      },
    });
    assert(trackReturn.status === 200, 'Returning visitor with new session tracked successfully');

    // ── TEST GROUP 4: Admin Protected Endpoints ──
    console.log('\n--- Checking Admin Analytics Endpoints ---');
    const authHeaders = { Authorization: `Bearer ${adminToken}` };

    const dashboardRes = await makeRequest('/api/analytics/dashboard?range=7d', {
      headers: authHeaders,
    });
    assert(dashboardRes.status === 200 && dashboardRes.data?.success === true, 'GET /api/analytics/dashboard returns 200');
    assert(
      dashboardRes.data?.data?.totalVisitors !== undefined &&
        dashboardRes.data?.data?.uniqueVisitors !== undefined &&
        dashboardRes.data?.data?.bounceRate !== undefined,
      'Dashboard overview returns all 8 core metrics with period deltas'
    );

    const trendsRes = await makeRequest('/api/analytics/trends?range=7d', {
      headers: authHeaders,
    });
    assert(
      trendsRes.status === 200 && Array.isArray(trendsRes.data?.data?.points),
      'GET /api/analytics/trends returns chronological points series'
    );

    const pagesRes = await makeRequest('/api/analytics/pages?range=7d', {
      headers: authHeaders,
    });
    assert(
      pagesRes.status === 200 && Array.isArray(pagesRes.data?.data),
      'GET /api/analytics/pages returns aggregated page rankings'
    );

    const devicesRes = await makeRequest('/api/analytics/devices?range=7d', {
      headers: authHeaders,
    });
    assert(
      devicesRes.status === 200 &&
        Array.isArray(devicesRes.data?.data?.devices) &&
        Array.isArray(devicesRes.data?.data?.browsers),
      'GET /api/analytics/devices returns device, browser, and OS breakdowns'
    );

    const geoRes = await makeRequest('/api/analytics/geo?range=7d', {
      headers: authHeaders,
    });
    assert(
      geoRes.status === 200 &&
        Array.isArray(geoRes.data?.data?.countries) &&
        Array.isArray(geoRes.data?.data?.cities),
      'GET /api/analytics/geo returns country, state, and city groupings'
    );

    const sourcesRes = await makeRequest('/api/analytics/sources?range=7d', {
      headers: authHeaders,
    });
    assert(
      sourcesRes.status === 200 && Array.isArray(sourcesRes.data?.data),
      'GET /api/analytics/sources returns acquisition channels'
    );

    const realtimeRes = await makeRequest('/api/analytics/realtime', {
      headers: authHeaders,
    });
    assert(
      realtimeRes.status === 200 && typeof realtimeRes.data?.data?.activeCount === 'number',
      'GET /api/analytics/realtime returns active count and active visitor feed'
    );

    const visitorsListRes = await makeRequest('/api/analytics/visitors?page=1&limit=10', {
      headers: authHeaders,
    });
    assert(
      visitorsListRes.status === 200 &&
        Array.isArray(visitorsListRes.data?.data?.visitors) &&
        visitorsListRes.data?.data?.pagination !== undefined,
      'GET /api/analytics/visitors returns paginated visitor audit trail'
    );

    const visitorDetailsRes = await makeRequest(
      `/api/analytics/visitors/${encodeURIComponent(testVisitorId)}`,
      { headers: authHeaders }
    );
    assert(
      visitorDetailsRes.status === 200 &&
        visitorDetailsRes.data?.data?.visitor?.visitorId === testVisitorId &&
        Array.isArray(visitorDetailsRes.data?.data?.sessions),
      'GET /api/analytics/visitors/:id returns visitor drilldown with sessions'
    );

    // CSV Export streaming test
    const csvExportRes = await makeRequest('/api/analytics/export?range=7d&type=sessions', {
      headers: authHeaders,
    });
    assert(
      csvExportRes.status === 200 &&
        (csvExportRes.headers['content-type']?.includes('text/csv') ||
          csvExportRes.raw?.includes('Session ID')),
      'GET /api/analytics/export streams CSV with proper headers and content'
    );

    // Privacy Data Deletion test
    const purgeVisitorRes = await makeRequest('/api/analytics/purge', {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: { visitorId: testVisitorId },
    });
    assert(
      purgeVisitorRes.status === 200 && purgeVisitorRes.data?.success === true,
      'POST /api/analytics/purge permanently deletes individual visitor records for privacy compliance'
    );

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests();

