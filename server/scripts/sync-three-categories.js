const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../src/config/db');
const Company = require('../src/models/Company');
const InterviewExperience = require('../src/models/InterviewExperience');
const Question = require('../src/models/Question');

async function syncCategories() {
  await connectDB();
  console.log('--- Syncing Three Data Categories (2024, 2025, Report – 2026) ---');

  // 1. Update Placement Data.docx experiences to placementYear: 2026
  const updateResult = await InterviewExperience.updateMany(
    { sourceDocument: 'Placement Data.docx' },
    { $set: { placementYear: 2026 } }
  );
  console.log(`Updated ${updateResult.modifiedCount} experiences from Placement Data.docx to placementYear: 2026`);

  // 2. Also ensure any experiences with null placementYear are updated to 2026
  const nullResult = await InterviewExperience.updateMany(
    { placementYear: null },
    { $set: { placementYear: 2026 } }
  );
  if (nullResult.modifiedCount > 0) {
    console.log(`Updated ${nullResult.modifiedCount} null placementYear experiences to 2026`);
  }

  // 3. Re-sync all companies' placementYears array and totalExperiencesCount
  const companies = await Company.find({});
  console.log(`Re-indexing placementYears across ${companies.length} companies...`);

  for (const comp of companies) {
    const exps = await InterviewExperience.find({ company: comp._id }).lean();
    const years = [
      ...new Set(
        exps
          .map((e) => e.placementYear)
          .filter((y) => y !== null && y !== undefined && !isNaN(y))
      ),
    ].sort((a, b) => a - b);

    comp.placementYears = years;
    comp.totalExperiencesCount = exps.length;
    await comp.save();
  }

  // 4. Verification and metrics summary
  const exp2024 = await InterviewExperience.countDocuments({ placementYear: 2024 });
  const exp2025 = await InterviewExperience.countDocuments({ placementYear: 2025 });
  const exp2026 = await InterviewExperience.countDocuments({ placementYear: 2026 });
  const expTotal = await InterviewExperience.countDocuments();

  const comp2024 = await Company.countDocuments({ placementYears: 2024 });
  const comp2025 = await Company.countDocuments({ placementYears: 2025 });
  const comp2026 = await Company.countDocuments({ placementYears: 2026 });
  const compTotal = await Company.countDocuments();

  console.log('====================================================');
  console.log('THREE DATA CATEGORIES SYNC COMPLETE:');
  console.log(`1. 2024:          ${exp2024} experiences across ${comp2024} companies`);
  console.log(`2. 2025:          ${exp2025} experiences across ${comp2025} companies`);
  console.log(`3. Report – 2026: ${exp2026} experiences across ${comp2026} companies`);
  console.log(`Total:            ${expTotal} experiences across ${compTotal} companies`);
  console.log('====================================================');

  process.exit(0);
}

syncCategories().catch((err) => {
  console.error('Error syncing categories:', err);
  process.exit(1);
});

