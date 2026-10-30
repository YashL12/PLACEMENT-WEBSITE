const CodingQuestion = require('../models/CodingQuestion');

/**
 * Language ID mappings for Judge0 CE (hosted on RapidAPI or self-hosted).
 * Language IDs match Judge0 CE v1.13 standard.
 * https://ce.judge0.com/
 */
const JUDGE0_LANG_IDS = {
  python: 71,     // Python 3.8.1
  javascript: 63, // Node.js 12.14.0
  java: 62,       // Java (OpenJDK 13.0.1)
};

const ALLOWED_LANGS = Object.keys(JUDGE0_LANG_IDS);

// Max payload sizes to prevent abuse
const MAX_CODE_BYTES = 32_000;   // 32 KB
const MAX_INPUT_BYTES = 8_000;   // 8 KB per test case input
const MAX_CONCURRENT = 4;        // Don't send > 4 test cases at once (stay within free tier)

// In-memory very simple concurrency guard
let activeRequests = 0;

/**
 * Encode string to base64 for Judge0 API.
 */
function toBase64(str) {
  return Buffer.from(str || '', 'utf8').toString('base64');
}

/**
 * Decode base64 from Judge0 API response.
 */
function fromBase64(b64) {
  if (!b64) return '';
  return Buffer.from(b64, 'base64').toString('utf8');
}

/**
 * Submit a single test case to the configured Judge0 provider.
 * Returns the result object or throws.
 */
async function submitToJudge0(langId, code, stdin, apiKey, apiUrl) {
  const body = {
    language_id: langId,
    source_code: toBase64(code),
    stdin: toBase64(stdin),
    base64_encoded: true,
    wait: true,         // Synchronous — simpler for free tier
  };

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // Support both RapidAPI and direct Judge0 CE deployments
  if (apiKey) {
    if (apiUrl && apiUrl.includes('rapidapi')) {
      headers['X-RapidAPI-Key'] = apiKey;
      headers['X-RapidAPI-Host'] = new URL(apiUrl).hostname;
    } else {
      headers['X-Auth-Token'] = apiKey;
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000); // 15s timeout

  try {
    const res = await fetch(`${apiUrl}/submissions?base64_encoded=true&wait=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Provider returned ${res.status}: ${text.slice(0, 200)}`);
    }

    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Map Judge0 status id to human-readable result.
 */
function interpretResult(submission, expectedOutput) {
  const statusId = submission.status?.id;
  const actualOutput = fromBase64(submission.stdout).trim();
  const expected = (expectedOutput || '').trim();
  const stderr = fromBase64(submission.stderr) || '';
  const compileError = fromBase64(submission.compile_output) || '';

  // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer,
  //             5=TLE, 6=CE, 7=RE(SIGSEGV), 8=RE(SIGXFSZ), 9=RE(SIGFPE),
  //             10=RE(SIGABRT), 11=RE(NZEC), 12=RE(Other), 13=Internal Error
  if (statusId === 6) {
    return { passed: false, error: `Compilation Error:\n${compileError}`, actual: '', expected };
  }
  if (statusId === 5) {
    return { passed: false, error: 'Time Limit Exceeded', actual: '', expected };
  }
  if (statusId >= 7 && statusId <= 12) {
    return { passed: false, error: `Runtime Error:\n${stderr || compileError}`, actual: '', expected };
  }
  if (statusId === 13) {
    return { passed: false, error: 'Internal execution error. Please try again.', actual: '', expected };
  }

  // Normalise output comparison (trim trailing whitespace per line)
  const normalise = (s) =>
    s.split('\n').map((l) => l.trimEnd()).join('\n').trim();

  const passed = normalise(actualOutput) === normalise(expected);
  return { passed, actual: actualOutput, expected, error: null };
}

/**
 * POST /api/execute
 * Body: { slug, lang, code }
 *
 * The server:
 * 1. Validates lang and code size.
 * 2. Looks up the question to get public sample test cases.
 * 3. Forwards one submission per test case to the configured provider.
 * 4. Returns per-test-case pass/fail results.
 *
 * API secrets stay server-side — never exposed to the client.
 */
const executeCode = async (req, res, next) => {
  try {
    // Concurrency guard for free-tier resource protection
    if (activeRequests >= MAX_CONCURRENT) {
      return res.status(429).json({
        success: false,
        message: 'Execution server is busy. Please wait a moment and try again.',
      });
    }

    const { slug, lang, code } = req.body || {};

    // Validate lang
    if (!lang || !ALLOWED_LANGS.includes(lang)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language. Allowed: ${ALLOWED_LANGS.join(', ')}`,
      });
    }

    // Validate code
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }
    if (Buffer.byteLength(code, 'utf8') > MAX_CODE_BYTES) {
      return res.status(400).json({ success: false, message: 'Code is too large (max 32 KB)' });
    }

    // Validate slug and fetch sample test cases
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ success: false, message: 'slug is required' });
    }

    const question = await CodingQuestion.findOne(
      { slug: slug.toLowerCase(), isPublished: true },
      { sampleTestCases: 1, category: 1 }
    ).lean();

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (question.category === 'SQL') {
      return res.status(400).json({
        success: false,
        message: 'SQL questions run client-side. No server execution needed.',
      });
    }

    const testCases = question.sampleTestCases || [];
    if (testCases.length === 0) {
      return res.status(200).json({
        success: true,
        data: { results: [], summary: '0/0 sample tests passed.' },
      });
    }

    // Check provider configuration — defaults to public Judge0 CE if unset
    const apiUrl = process.env.JUDGE0_API_URL || process.env.JUDGE0_PRIMARY_URL || 'https://ce.judge0.com';
    const apiKey = process.env.JUDGE0_API_KEY || process.env.JUDGE0_PRIMARY_KEY || '';
    const fallbackUrl = process.env.JUDGE0_FALLBACK_URL;
    const fallbackKey = process.env.JUDGE0_FALLBACK_KEY;

    const langId = JUDGE0_LANG_IDS[lang];

    // Validate each test case input size
    for (const tc of testCases) {
      if (Buffer.byteLength(tc.input || '', 'utf8') > MAX_INPUT_BYTES) {
        return res.status(400).json({ success: false, message: 'Test case input too large' });
      }
    }

    activeRequests++;

    try {
      // Execute test cases sequentially to be gentle on the free tier
      const results = [];
      let useUrl = apiUrl;
      let useKey = apiKey;

      for (const [i, tc] of testCases.entries()) {
        let submission;
        try {
          submission = await submitToJudge0(langId, code, tc.input || '', useKey, useUrl);
        } catch (providerErr) {
          // Try fallback if configured
          if (fallbackUrl && useUrl !== fallbackUrl) {
            try {
              useUrl = fallbackUrl;
              useKey = fallbackKey;
              submission = await submitToJudge0(langId, code, tc.input || '', useKey, useUrl);
            } catch (fallbackErr) {
              return res.status(503).json({
                success: false,
                message: 'Code execution provider is unavailable. Please try again later.',
              });
            }
          } else {
            return res.status(503).json({
              success: false,
              message: 'Code execution provider is unavailable. Please try again later.',
            });
          }
        }

        const result = interpretResult(submission, tc.expectedOutput);
        results.push({
          index: i,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation,
          ...result,
        });
      }

      const passed = results.filter((r) => r.passed).length;
      const total = results.length;
      const summary = `${passed}/${total} sample test${total !== 1 ? 's' : ''} passed.`;

      return res.json({ success: true, data: { results, summary } });
    } finally {
      activeRequests--;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = executeCode;
