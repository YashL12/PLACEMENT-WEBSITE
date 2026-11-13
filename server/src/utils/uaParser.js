/**
 * Lightweight User-Agent parser
 * Extracts Browser, OS, and Device Category without external dependencies
 */

function parseUserAgent(uaString) {
  if (!uaString || typeof uaString !== 'string') {
    return {
      browser: 'Unknown',
      browserVersion: '',
      os: 'Unknown',
      osVersion: '',
      device: 'Desktop',
    };
  }

  const ua = uaString;

  // --- DEVICE CATEGORY DETECTION ---
  let device = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = 'Tablet';
  } else if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(
      ua
    )
  ) {
    device = 'Mobile';
  }

  // --- BROWSER DETECTION ---
  let browser = 'Unknown';
  let browserVersion = '';

  if (/Edg(?:e|A|iOS)?\/([0-9.]+)/i.test(ua)) {
    browser = 'Edge';
    browserVersion = RegExp.$1.split('.')[0];
  } else if (/OPR\/([0-9.]+)|Opera\/([0-9.]+)/i.test(ua)) {
    browser = 'Opera';
    browserVersion = (RegExp.$1 || RegExp.$2).split('.')[0];
  } else if (/Chrome\/([0-9.]+)/i.test(ua) && !/Chromium|Edg|OPR/i.test(ua)) {
    browser = 'Chrome';
    browserVersion = RegExp.$1.split('.')[0];
  } else if (/CriOS\/([0-9.]+)/i.test(ua)) {
    browser = 'Chrome (iOS)';
    browserVersion = RegExp.$1.split('.')[0];
  } else if (/Firefox\/([0-9.]+)/i.test(ua) || /FxiOS\/([0-9.]+)/i.test(ua)) {
    browser = 'Firefox';
    browserVersion = RegExp.$1.split('.')[0];
  } else if (/Version\/([0-9.]+).*Safari/i.test(ua) && !/Chrome|Android/i.test(ua)) {
    browser = 'Safari';
    browserVersion = RegExp.$1.split('.')[0];
  } else if (/MSIE ([0-9.]+)|Trident\/.*rv:([0-9.]+)/i.test(ua)) {
    browser = 'Internet Explorer';
    browserVersion = (RegExp.$1 || RegExp.$2).split('.')[0];
  } else if (/curl|wget|bot|crawler|spider/i.test(ua)) {
    browser = 'Bot/Crawler';
  }

  // --- OS DETECTION ---
  let os = 'Unknown';
  let osVersion = '';

  if (/Windows NT 10.0/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/Windows NT 6.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/Windows NT 6.2/i.test(ua)) {
    os = 'Windows 8';
  } else if (/Windows NT 6.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/Windows NT/i.test(ua)) {
    os = 'Windows';
  } else if (/Android\s*([0-9.]+)?/i.test(ua)) {
    os = 'Android';
    osVersion = RegExp.$1 || '';
  } else if (/iPhone OS ([0-9_]+)/i.test(ua)) {
    os = 'iOS';
    osVersion = (RegExp.$1 || '').replace(/_/g, '.');
  } else if (/iPad.*OS ([0-9_]+)/i.test(ua)) {
    os = 'iPadOS';
    osVersion = (RegExp.$1 || '').replace(/_/g, '.');
  } else if (/Mac OS X\s*([0-9_]+)?/i.test(ua)) {
    os = 'macOS';
    osVersion = (RegExp.$1 || '').replace(/_/g, '.');
  } else if (/CrOS/i.test(ua)) {
    os = 'Chrome OS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
  };
}

module.exports = { parseUserAgent };

