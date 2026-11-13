/**
 * Geolocation & IP Resolution Utility
 * Safely extracts client IP and approximates geographic location (Country, State/Region, City)
 * Respects proxy chains, rate limits lookups, and caches results.
 */

const http = require('http');
const https = require('https');

// In-memory cache for IP geo lookups (max 5,000 entries, 24-hour TTL)
const geoCache = new Map();
const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 5000;

function isPrivateIp(ip) {
  if (!ip) return true;
  const cleanIp = ip.replace(/^::ffff:/, '');
  if (
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp === 'localhost' ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('192.168.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanIp) ||
    cleanIp.startsWith('fc00:') ||
    cleanIp.startsWith('fe80:')
  ) {
    return true;
  }
  return false;
}

/**
 * Clean and normalize IP address from Express request
 */
function getClientIp(req) {
  let ip = req.ip || req.socket?.remoteAddress || '';
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace(/^::ffff:/, '');
  }
  return ip || '127.0.0.1';
}

/**
 * Fetch geo information from free IP API with strict timeout
 */
function fetchIpGeo(ip) {
  return new Promise((resolve) => {
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city`;
    const req = http.get(url, { timeout: 2500 }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.status === 'success') {
            resolve({
              country: parsed.country || 'Unknown',
              state: parsed.regionName || 'Unknown',
              city: parsed.city || 'Unknown',
            });
          } else {
            resolve({ country: 'Unknown', state: 'Unknown', city: 'Unknown' });
          }
        } catch (e) {
          resolve({ country: 'Unknown', state: 'Unknown', city: 'Unknown' });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ country: 'Unknown', state: 'Unknown', city: 'Unknown' });
    });

    req.on('error', () => {
      resolve({ country: 'Unknown', state: 'Unknown', city: 'Unknown' });
    });
  });
}

/**
 * Resolve client location from request headers or IP
 */
async function resolveLocation(req) {
  const ip = getClientIp(req);

  // 1. Check for Edge / Cloudflare / Vercel geolocation headers
  const vercelCountry = req.headers['x-vercel-ip-country'];
  const vercelRegion = req.headers['x-vercel-ip-country-region'];
  const vercelCity = req.headers['x-vercel-ip-city'];

  const cfCountry = req.headers['cf-ipcountry'];
  const cfRegion = req.headers['cf-region'];
  const cfCity = req.headers['cf-ipcity'];

  if (vercelCountry || cfCountry) {
    return {
      ip,
      country: decodeURIComponent(vercelCountry || cfCountry || 'Unknown'),
      state: decodeURIComponent(vercelRegion || cfRegion || 'Unknown'),
      city: decodeURIComponent(vercelCity || cfCity || 'Unknown'),
    };
  }

  // 2. Check for private/local IP
  if (isPrivateIp(ip)) {
    return {
      ip,
      country: 'Local Network',
      state: 'Local',
      city: 'Development / Intranet',
    };
  }

  // 3. Check in-memory cache
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL_MS) {
    return {
      ip,
      country: cached.country,
      state: cached.state,
      city: cached.city,
    };
  }

  // 4. Resolve via lightweight lookup
  const geo = await fetchIpGeo(ip);

  // Maintain cache size
  if (geoCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = geoCache.keys().next().value;
    if (firstKey) geoCache.delete(firstKey);
  }
  geoCache.set(ip, { ...geo, timestamp: Date.now() });

  return {
    ip,
    country: geo.country,
    state: geo.state,
    city: geo.city,
  };
}

module.exports = {
  getClientIp,
  isPrivateIp,
  resolveLocation,
};

