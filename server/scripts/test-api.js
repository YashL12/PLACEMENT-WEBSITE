const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
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
  console.log('RUNNING AUTOMATED BACKEND API TESTS');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`PASS: ${message}`);
      passed++;
    } else {
      console.error(`FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Health Check
    const health = await makeRequest('/api/health');
    assert(health.status === 200 && health.data.success === true, 'GET /api/health returns 200 OK');

    // Test 2: Public Company Listing
    const companiesRes = await makeRequest('/api/companies');
    assert(
      companiesRes.status === 200 &&
      companiesRes.data.success === true &&
      companiesRes.data.data.companies.length > 0,
      `GET /api/companies returns list of companies (count: ${companiesRes.data?.data?.companies?.length})`
    );

    // Test 3: Search by alias ("TSS")
    const searchTss = await makeRequest('/api/companies?search=TSS');
    assert(
      searchTss.status === 200 &&
      searchTss.data.data.companies.some((c) => c.name.includes('TSS')),
      'GET /api/companies?search=TSS resolves alias to TSS Consultancy Private Limited'
    );

    // Test 4: Search by alias ("RKIT")
    const searchRkit = await makeRequest('/api/companies?search=RKIT');
    assert(
      searchRkit.status === 200 &&
      searchRkit.data.data.companies.some((c) => c.name.includes('RKIT')),
      'GET /api/companies?search=RKIT resolves to RKIT Software Pvt Ltd'
    );

    // Test 5: Company Details with Experiences, Rounds, and Questions
    const firstCompany = companiesRes.data.data.companies[0];
    const compDetail = await makeRequest(`/api/companies/${firstCompany._id}`);
    assert(
      compDetail.status === 200 &&
      compDetail.data.data.company &&
      Array.isArray(compDetail.data.data.experiences),
      `GET /api/companies/:id returns company detail with nested experiences (Company: ${firstCompany.name})`
    );

    if (compDetail.data.data.experiences.length > 0) {
      const exp = compDetail.data.data.experiences[0];
      assert(
        Array.isArray(exp.rounds),
        `Experience contains nested rounds (count: ${exp.rounds.length})`
      );
      if (exp.rounds.length > 0) {
        assert(
          Array.isArray(exp.rounds[0].questions),
          `Round contains nested questions (count: ${exp.rounds[0].questions.length})`
        );
      }
    }

    // Test 6: Verify unpublished / flagged records are hidden from public
    const unassignedCheck = await makeRequest('/api/companies?search=Unassigned');
    assert(
      unassignedCheck.data.data.companies.length === 0,
      'Unpublished review-queue records are hidden from default public student search'
    );

    // Test 7: Admin Login with valid credentials
    const loginRes = await makeRequest('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: 'admin@placementportal.edu',
        password: 'AdminPlacement@2026',
      },
    });
    assert(
      loginRes.status === 200 && loginRes.data.data?.token,
      'POST /api/admin/login authenticates and returns JWT token'
    );

    const token = loginRes.data.data?.token;

    // Test 8: Admin Login with invalid credentials rejects
    const badLogin = await makeRequest('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: 'admin@placementportal.edu',
        password: 'WrongPassword123!',
      },
    });
    assert(badLogin.status === 401, 'POST /api/admin/login rejects invalid password with 401');

    // Test 9: Protected stats route rejects without token
    const unauthStats = await makeRequest('/api/admin/stats');
    assert(unauthStats.status === 401, 'GET /api/admin/stats rejects unauthorized request with 401');

    // Test 10: Protected stats route succeeds with token
    const authStats = await makeRequest('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(
      authStats.status === 200 && authStats.data.data?.totals?.questions > 700,
      `GET /api/admin/stats returns statistics (Questions in DB: ${authStats.data?.data?.totals?.questions})`
    );

    // Test 11: Admin Review Queue
    const reviewQueue = await makeRequest('/api/admin/review-queue', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(
      reviewQueue.status === 200 && reviewQueue.data.data?.companies?.length > 0,
      `GET /api/admin/review-queue returns flagged records needing review (Count: ${reviewQueue.data?.data?.companies?.length})`
    );

    console.log('====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
