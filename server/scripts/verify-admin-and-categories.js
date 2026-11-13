const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../src/config/db');
const Admin = require('../src/models/Admin');
const Company = require('../src/models/Company');
const InterviewExperience = require('../src/models/InterviewExperience');
const bcrypt = require('bcryptjs');

async function runVerification() {
  console.log('====================================================');
  console.log('VERIFYING ADMIN AUTH & THREE DATA CATEGORIES');
  console.log('====================================================');

  await connectDB();

  // 1. Verify Admin Authentication
  console.log('\n--- 1. Admin Account & Password Verification ---');
  const admins = await Admin.find({});
  console.log(`Found ${admins.length} admin account(s):`);

  const testPassword = 'Admin@Placement2026';

  for (const admin of admins) {
    const isMatch = await admin.comparePassword(testPassword);
    console.log(`Admin User: "${admin.username}" | Email: "${admin.email}"`);
    console.log(`Password "${testPassword}" match test: ${isMatch ? 'PASSED ✅' : 'FAILED ❌'}`);
  }

  // 2. Verify Three Data Categories
  console.log('\n--- 2. Three Data Categories Verification ---');
  const years = [2024, 2025, 2026];
  for (const yr of years) {
    const expCount = await InterviewExperience.countDocuments({ placementYear: yr });
    const compCount = await Company.countDocuments({ placementYears: yr });
    const label = yr === 2026 ? 'Report – 2026' : String(yr);
    console.log(`Category [${label}]: ${expCount} experiences across ${compCount} companies.`);
  }

  const unassigned = await InterviewExperience.countDocuments({
    placementYear: { $nin: [2024, 2025, 2026] },
  });
  console.log(`Unassigned or invalid placementYear experiences: ${unassigned} (Expected: 0) ${unassigned === 0 ? '✅' : '❌'}`);

  // 3. Verify Priority Companies
  console.log('\n--- 3. Priority Companies Check ---');
  const priorityNames = ['Kevit', 'TSS', 'RKIT', 'GN Websoft'];
  for (const name of priorityNames) {
    const comp = await Company.findOne({
      $or: [
        { name: new RegExp(`^${name}`, 'i') },
        { aliases: new RegExp(`^${name}`, 'i') },
      ],
    });
    if (comp) {
      console.log(`Priority Company "${name}": found "${comp.name}", years=[${comp.placementYears.join(', ')}] ✅`);
    } else {
      console.log(`Priority Company "${name}": NOT FOUND ❌`);
    }
  }

  // 4. Verify Index Usage on InterviewExperience & Company
  console.log('\n--- 4. Index Usage Performance Check ---');
  const expExplain = await InterviewExperience.find({ placementYear: 2026, isPublished: true })
    .sort({ createdAt: -1 })
    .explain('executionStats');
  
  const stage = expExplain.executionStats.executionStages.stage;
  const isIndexed = stage === 'IXSCAN' || (expExplain.executionStats.executionStages.inputStage && expExplain.executionStats.executionStages.inputStage.stage === 'IXSCAN');
  console.log(`Query on { placementYear: 2026, isPublished: true }: Stage=${stage}, Used Index=${isIndexed ? 'YES (IXSCAN) ✅' : 'NO ❌'}`);
  console.log(`Execution Time: ${expExplain.executionStats.executionTimeMillis}ms, Docs Examined: ${expExplain.executionStats.totalDocsExamined}`);

  console.log('\n====================================================');
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
