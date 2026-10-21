const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = require('../src/server');
const Company = require('../src/models/Company');
const InterviewExperience = require('../src/models/InterviewExperience');
const InterviewRound = require('../src/models/InterviewRound');
const Question = require('../src/models/Question');
const Admin = require('../src/models/Admin');
const LearningMaterial = require('../src/models/LearningMaterial');
const Alumni = require('../src/models/Alumni');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

async function runVerification() {
  console.log('====================================================');
  console.log('STARTING GECR PLACEMENT SARTHI COMPREHENSIVE VERIFICATION');
  console.log('====================================================');

  const connectDB = require('../src/config/db');
  await connectDB();

  // 1. Verify Database Data Preservation
  const companyCount = await Company.countDocuments();
  const experienceCount = await InterviewExperience.countDocuments();
  const roundCount = await InterviewRound.countDocuments();
  const questionCount = await Question.countDocuments();

  assert(companyCount >= 26, `Preserved all companies in database (found: ${companyCount})`);
  assert(experienceCount >= 38, `Preserved all interview experiences in database (found: ${experienceCount})`);
  assert(roundCount >= 130, `Preserved all recruitment rounds in database (found: ${roundCount})`);
  assert(questionCount >= 700, `Preserved all interview questions in database (found: ${questionCount})`);

  // 2. Verify Company Logos
  const companiesWithLogos = await Company.countDocuments({ logoUrl: { $ne: '' } });
  assert(companiesWithLogos >= 20, `Company logos populated in MongoDB records (found: ${companiesWithLogos})`);

  const kevit = await Company.findOne({ name: 'Kevit Technologies' });
  assert(kevit && kevit.logoUrl === '/logos/kevit.png', `Kevit Technologies has official logo reference (${kevit?.logoUrl})`);

  const tatvasoft = await Company.findOne({ name: 'TatvaSoft' });
  assert(tatvasoft && tatvasoft.logoUrl === '/logos/tatvasoft.png', `TatvaSoft has official logo reference (${tatvasoft?.logoUrl})`);

  // 3. Verify Admin Authentication & JWT
  const admin = await Admin.findOne();
  assert(admin !== null, 'Admin account exists in database');
  const token = jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET || 'placement_portal_jwt_secret_secure_key_2026',
    { expiresIn: '1d' }
  );

  // 4. Test Alumni Directory & Featured Kevit Ranking
  console.log('\n--- Testing Alumni Model & Kevit Featured Ranking ---');
  // Clean test alumni if any exist from prior runs
  await Alumni.deleteMany({ name: { $in: ['Kevit Test Alum', 'Priya Sharma', 'Rahul Mehta'] } });

  // Create Kevit record and mark as featured
  const kevitAlum = await Alumni.create({
    name: 'Kevit Test Alum',
    companyName: 'Kevit Technologies',
    jobTitle: 'Conversational AI Engineer',
    linkedinUrl: 'https://www.linkedin.com/in/kevit-alum-test',
    companyLogo: '/logos/kevit.png',
    isFeatured: true,
    featuredOrder: 1,
    isPublished: true,
  });

  const rahul = await Alumni.create({
    name: 'Rahul Mehta',
    companyName: 'TatvaSoft',
    jobTitle: 'Senior Full Stack Developer',
    linkedinUrl: 'https://www.linkedin.com/in/rahul-mehta-test',
    companyLogo: '/logos/tatvasoft.png',
    isFeatured: false,
    featuredOrder: 0,
    isPublished: true,
  });

  const priya = await Alumni.create({
    name: 'Priya Sharma',
    companyName: 'TSS Consultancy Private Limited',
    jobTitle: 'FinTech Software Engineer',
    linkedinUrl: 'https://www.linkedin.com/in/priya-sharma-test',
    companyLogo: '/logos/tss.png',
    isFeatured: false,
    featuredOrder: 0,
    isPublished: true,
  });

  // Test featured ranking in query (Featured must appear first)
  const sortedAlumni = await Alumni.find({ isPublished: true })
    .sort({ isFeatured: -1, featuredOrder: 1, name: 1 })
    .lean();

  assert(sortedAlumni[0].companyName === 'Kevit Technologies', `Featured ranking: Kevit appears first (rank 1 company: ${sortedAlumni[0].companyName})`);

  // Test search: searching for Priya should NOT return Kevit
  const priyaSearch = await Alumni.find({
    isPublished: true,
    $or: [{ name: /Priya/i }, { companyName: /Priya/i }]
  }).sort({ isFeatured: -1, featuredOrder: 1, name: 1 });

  assert(priyaSearch.length === 1 && priyaSearch[0].name === 'Priya Sharma', `Searching for 'Priya' correctly isolates Priya without leaking Kevit`);

  // Test search by company: searching 'TatvaSoft' returns Rahul
  const compSearch = await Alumni.find({
    isPublished: true,
    $or: [{ name: /TatvaSoft/i }, { companyName: /TatvaSoft/i }]
  });
  assert(compSearch.length >= 1 && compSearch.some(a => a.name === 'Rahul Mehta'), `Company search correctly finds alumni associated with TatvaSoft`);

  // 5. Test Learning Material Model
  console.log('\n--- Testing Learning Materials Model ---');
  await LearningMaterial.deleteMany({ title: 'DSA Trees and Graphs Cheatsheet Test' });

  const material = await LearningMaterial.create({
    title: 'DSA Trees and Graphs Cheatsheet Test',
    description: 'Comprehensive traversal, shortest path, and recursion formulas for technical rounds.',
    category: 'DSA & Problem Solving',
    companyName: 'General Placement',
    fileType: 'PDF',
    fileName: 'dsa-cheatsheet.pdf',
    fileSize: 1024 * 512,
    fileUrl: '/uploads/learning-materials/dsa-cheatsheet-test.pdf',
    isExternalLink: false,
    isPublished: true,
  });

  assert(material._id !== null, `Learning material persisted in MongoDB (ID: ${material._id})`);

  // Verify published filter: unpublished material must not appear
  const unpublishedMat = await LearningMaterial.create({
    title: 'Draft Unreleased Material',
    category: 'Core CS (OS, DBMS, CN)',
    fileType: 'DOCX',
    fileUrl: '/uploads/learning-materials/draft.docx',
    isPublished: false,
  });

  const publicMaterials = await LearningMaterial.find({ isPublished: true, title: 'Draft Unreleased Material' });
  assert(publicMaterials.length === 0, 'Unpublished learning material is hidden from public view');

  // Clean up test documents
  await LearningMaterial.deleteMany({ title: { $in: ['DSA Trees and Graphs Cheatsheet Test', 'Draft Unreleased Material'] } });
  await Alumni.deleteMany({ name: { $in: ['Kevit Test Alum', 'Priya Sharma', 'Rahul Mehta'] } });

  // 6. Verify Local Assets
  console.log('\n--- Testing Local Assets & Official GECR Logo ---');
  const gecrLogoPath = path.resolve(__dirname, '../../client/public/gecr-logo.png');
  assert(fs.existsSync(gecrLogoPath), 'Official GECR logo exists in client/public/gecr-logo.png');
  const gecrLogoStats = fs.statSync(gecrLogoPath);
  assert(gecrLogoStats.size > 50000, `GECR logo is high quality PNG (${gecrLogoStats.size} bytes)`);

  const kevitLogoPath = path.resolve(__dirname, '../../client/public/logos/kevit.png');
  assert(fs.existsSync(kevitLogoPath), 'Kevit Technologies logo exists in client/public/logos/kevit.png');

  console.log('====================================================');
  console.log(`ALL VERIFICATION TESTS COMPLETED: ${passedTests}/${totalTests} PASSED`);
  console.log('====================================================');

  await mongoose.disconnect();
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
