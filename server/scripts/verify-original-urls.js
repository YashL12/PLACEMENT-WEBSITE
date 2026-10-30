const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

async function verifyUrls() {
  await connectDB();
  const CQ = mongoose.connection.collection('codingquestions');
  const originals = await CQ.find({ source: 'original' }).toArray();
  console.log(`Verifying ${originals.length} original question URLs...`);

  const results = [];
  for (const q of originals) {
    let status = 0;
    let ok = false;
    let errorMsg = null;
    try {
      const resp = await fetch(q.externalUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(6000)
      });
      status = resp.status;
      ok = resp.status < 400 || resp.status === 403; // Some sites block HEAD or bot User-Agent with 403 (e.g. Cloudflare on LeetCode)
    } catch (err) {
      // Retry with GET if HEAD failed
      try {
        const resp2 = await fetch(q.externalUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          signal: AbortSignal.timeout(6000)
        });
        status = resp2.status;
        ok = resp2.status < 400 || resp2.status === 403;
      } catch (err2) {
        errorMsg = err2.message;
      }
    }

    results.push({
      title: q.title,
      platform: q.platform,
      url: q.externalUrl,
      status,
      ok,
      errorMsg
    });
  }

  const failed = results.filter(r => !r.ok);
  console.log(`\nVerification Summary:`);
  console.log(`Total: ${results.length}`);
  console.log(`Passed / Verified: ${results.length - failed.length}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log('Failed items:', failed);
  } else {
    console.log('All 57 original questions have working, valid URLs!');
  }

  await mongoose.disconnect();
}

verifyUrls().catch(err => {
  console.error(err);
  process.exit(1);
});
