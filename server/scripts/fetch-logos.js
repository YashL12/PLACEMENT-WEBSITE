const fs = require('fs');
const path = require('path');

const companies = [
  { name: 'Kevit Technologies', domain: 'kevit.io', slug: 'kevit' },
  { name: 'TatvaSoft', domain: 'tatvasoft.com', slug: 'tatvasoft' },
  { name: 'TSS Consultancy Private Limited', domain: 'tssconsultancy.com', slug: 'tss' },
  { name: 'eSparkBiz', domain: 'esparkinfo.com', slug: 'esparkbiz' },
  { name: 'eInfochips', domain: 'einfochips.com', slug: 'einfochips' },
  { name: 'Silver Touch Technologies', domain: 'silvertouch.com', slug: 'silvertouch' },
  { name: 'Gateway Group', domain: 'gatewaygroup.com', slug: 'gateway' },
  { name: 'Improwised Technologies', domain: 'improwised.com', slug: 'improwised' },
  { name: 'Zeus Learning', domain: 'zeuslearning.com', slug: 'zeuslearning' },
  { name: 'Prominent Pixel', domain: 'prominentpixel.com', slug: 'prominentpixel', directLogo: 'https://prominentpixel.com/wp-content/uploads/2021/04/pp-logo.png' },
  { name: 'RKIT Software Pvt Ltd', domain: 'rkitsoftware.com', slug: 'rkit' },
  { name: 'Silent Infotech', domain: 'silentinfotech.com', slug: 'silentinfotech' },
  { name: 'Shaligram Infotech', domain: 'shaligraminfotech.com', slug: 'shaligram' },
  { name: 'Version Systems', domain: 'versionsystems.com', slug: 'versionsystems' },
  { name: 'GN Websoft', domain: 'gnwebsoft.com', slug: 'gnwebsoft' },
  { name: 'Vivansh Infotech', domain: 'vivanshinfotech.com', slug: 'vivansh' },
  { name: 'CyberCom Creations', domain: 'cybercomcreations.com', slug: 'cybercom' },
  { name: 'Tark Technologies', domain: 'tarktechnologies.com', slug: 'tark' },
  { name: 'KOOPS Technologies', domain: 'koops.in', slug: 'koops', directLogo: 'https://www.koops.in/images/logo.png' },
  { name: 'Inara Consultancy Services', domain: 'inaraconsultancy.com', slug: 'inara' },
  { name: 'TechXperts', domain: 'techxperts.co.in', slug: 'techxperts' },
  { name: 'Atri Solutions', domain: 'atrisolutions.com', slug: 'atrisolutions' },
  { name: 'Sampaarsh Technology', domain: 'sampaarsh.com', slug: 'sampaarsh' }
];

async function run() {
  const dir = path.resolve(__dirname, '../../client/public/logos');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const c of companies) {
    const filePath = path.join(dir, c.slug + '.png');
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 100) {
      console.log(`[EXISTS] ${c.slug}.png`);
      continue;
    }

    if (c.directLogo) {
      try {
        const res = await fetch(c.directLogo, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(filePath, buf);
          console.log(`[DIRECT SAVED] ${c.slug}.png (${buf.length} bytes)`);
          continue;
        }
      } catch (e) {
        console.log(`Direct logo failed for ${c.name}: ${e.message}`);
      }
    }

    // Try fetching from domain favicon / apple touch icon
    try {
      const pageRes = await fetch(`https://${c.domain}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await pageRes.text();
      const match = html.match(/<link[^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/i) ||
                    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["']/i);
      if (match && match[1]) {
        let iconUrl = match[1];
        if (iconUrl.startsWith('//')) iconUrl = 'https:' + iconUrl;
        else if (iconUrl.startsWith('/')) iconUrl = `https://${c.domain}${iconUrl}`;
        else if (!iconUrl.startsWith('http')) iconUrl = `https://${c.domain}/${iconUrl}`;

        const iconRes = await fetch(iconUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (iconRes.ok) {
          const buf = Buffer.from(await iconRes.arrayBuffer());
          fs.writeFileSync(filePath, buf);
          console.log(`[HTML SAVED] ${c.slug}.png from ${iconUrl} (${buf.length} bytes)`);
        }
      }
    } catch (e) {
      console.log(`HTML fetch failed for ${c.domain}: ${e.message}`);
    }
  }

  // Now update MongoDB companies with logoUrl
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
  const Company = require('../src/models/Company');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal');
  console.log('Connected to MongoDB. Updating company logoUrl records...');

  for (const c of companies) {
    const filePath = path.join(dir, c.slug + '.png');
    if (fs.existsSync(filePath)) {
      const logoUrl = `/logos/${c.slug}.png`;
      const res = await Company.updateOne(
        { name: c.name },
        { $set: { logoUrl } }
      );
      console.log(`[UPDATED] ${c.name} -> ${logoUrl} (matched: ${res.matchedCount})`);
    }
  }

  await mongoose.disconnect();
  console.log('MongoDB update complete.');
}

run();

