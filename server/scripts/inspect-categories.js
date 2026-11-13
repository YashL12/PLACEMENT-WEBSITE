const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Company = require('../src/models/Company');
const InterviewExperience = require('../src/models/InterviewExperience');
const Question = require('../src/models/Question');
const CodingQuestion = require('../src/models/CodingQuestion');

async function check() {
  await connectDB();
  const expYears = await InterviewExperience.distinct('placementYear');
  console.log('Distinct InterviewExperience.placementYear:', expYears);
  
  const expDocs = await InterviewExperience.distinct('sourceDocument');
  console.log('Distinct InterviewExperience.sourceDocument:', expDocs);
  
  const compYears = await Company.distinct('placementYears');
  console.log('Distinct Company.placementYears:', compYears);

  for (const doc of expDocs) {
    const count = await InterviewExperience.countDocuments({ sourceDocument: doc });
    const years = await InterviewExperience.distinct('placementYear', { sourceDocument: doc });
    console.log(`Document: '${doc}' -> Count: ${count}, placementYears:`, years);
  }

  for (const yr of expYears) {
    const count = await InterviewExperience.countDocuments({ placementYear: yr });
    console.log(`Year: ${yr} -> Count: ${count}`);
  }

  const qDocs = await Question.distinct('sourceDocument');
  console.log('Distinct Question.sourceDocument:', qDocs);

  // Check CodingQuestion
  const codingSources = await CodingQuestion.distinct('companyTagSource');
  console.log('Distinct CodingQuestion.companyTagSource:', codingSources);

  // Check companies count by placementYears
  const c2024 = await Company.countDocuments({ placementYears: 2024 });
  const c2025 = await Company.countDocuments({ placementYears: 2025 });
  const c2026 = await Company.countDocuments({ placementYears: 2026 });
  const cEmpty = await Company.countDocuments({ placementYears: { $size: 0 } });
  console.log(`Companies: 2024=${c2024}, 2025=${c2025}, 2026=${c2026}, empty=${cEmpty}`);

  const allComps = await Company.find({}, 'name placementYears totalExperiencesCount').lean();
  console.log('Sample companies:');
  allComps.slice(0, 15).forEach(c => {
    console.log(`- ${c.name}: placementYears=[${c.placementYears.join(', ')}], exps=${c.totalExperiencesCount}`);
  });

  process.exit(0);
}
check().catch(err => {
  console.error(err);
  process.exit(1);
});

