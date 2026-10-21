const path = require('path');
const ExcelJS = require('exceljs');
const mongoose = require('mongoose');

// Connect to database using centralized db connection
const connectDB = require('../src/config/db');

// Models
const Company = require('../src/models/Company');
const InterviewExperience = require('../src/models/InterviewExperience');
const InterviewRound = require('../src/models/InterviewRound');
const Question = require('../src/models/Question');
const Alumni = require('../src/models/Alumni');
const LearningMaterial = require('../src/models/LearningMaterial');
const ImportReport = require('../src/models/ImportReport');

async function exportDatabaseToExcel() {
  console.log('====================================================');
  console.log('EXPORTING MONGODB DATABASE TO PRIVATE EXCEL WORKBOOK');
  console.log('====================================================');

  await connectDB();
  console.log('Connected to MongoDB. Fetching current database records...');

  // 1. Fetch live database records
  const [
    companies,
    experiences,
    rounds,
    questions,
    alumniList,
    learningMaterials,
    importReports,
  ] = await Promise.all([
    Company.find({}).sort({ name: 1 }).lean(),
    InterviewExperience.find({}).populate('company', 'name').sort({ placementYear: -1, createdAt: 1 }).lean(),
    InterviewRound.find({}).populate('company', 'name').populate('experience', 'role placementYear').sort({ roundOrder: 1 }).lean(),
    Question.find({}).populate('company', 'name').populate('round', 'title roundType roundNumber').sort({ order: 1 }).lean(),
    Alumni.find({}).sort({ isFeatured: -1, featuredOrder: 1, name: 1 }).lean(),
    LearningMaterial.find({}).sort({ category: 1, title: 1 }).lean(),
    ImportReport.find({}).sort({ importDate: -1 }).lean(),
  ]);

  console.log(`- Retrieved ${companies.length} Companies`);
  console.log(`- Retrieved ${experiences.length} Experiences`);
  console.log(`- Retrieved ${rounds.length} Rounds`);
  console.log(`- Retrieved ${questions.length} Questions`);
  console.log(`- Retrieved ${alumniList.length} Alumni`);
  console.log(`- Retrieved ${learningMaterials.length} Learning Materials`);

  // 2. Initialize Excel Workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'GECR Placement Sarthi Administrator';
  workbook.lastModifiedBy = 'GECR Placement Sarthi';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Common Header Style Helper
  function applyHeaderStyles(worksheet, columnDefs) {
    worksheet.columns = columnDefs;
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    const headerRow = worksheet.getRow(1);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Calibri' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' }, // Professional Navy Blue
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
    });

    const lastColLetter = String.fromCharCode(64 + columnDefs.length);
    worksheet.autoFilter = `A1:${lastColLetter}1`;
  }

  function applyDataRowStyles(row, isEven) {
    row.eachCell((cell) => {
      cell.font = { size: 9.5, name: 'Calibri' };
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }
    });
  }

  // -------------------------------------------------------------
  // WORKSHEET 1: SUMMARY
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Summary');
  applyHeaderStyles(summarySheet, [
    { header: 'Metric Category', key: 'category', width: 32 },
    { header: 'Current Database Record Count', key: 'count', width: 30 },
    { header: 'Status / Notes', key: 'notes', width: 55 },
  ]);

  const summaryData = [
    { category: 'Recruiting Companies', count: companies.length, notes: 'Canonical company directory with normalized aliases and official logos' },
    { category: 'Interview Experiences', count: experiences.length, notes: 'Multi-year verified candidate recruitment processes (2024 & 2025)' },
    { category: 'Interview Rounds', count: rounds.length, notes: 'Aptitude, Technical Coding, Core CS, System Design, and HR interview rounds' },
    { category: 'Interview Questions & Problems', count: questions.length, notes: 'Authentic problem statements, constraints, and candidate interview questions' },
    { category: 'Alumni Network Profiles', count: alumniList.length, notes: 'Verified departmental alumni with separate profile photo handling & LinkedIn links' },
    { category: 'Learning Materials & Cheatsheets', count: learningMaterials.length, notes: 'Curated technical reference handbooks and aptitude sheets' },
    { category: 'Data Ingestion Reports', count: importReports.length, notes: 'Automated audit reports from Word docx and PDF data extractions' },
  ];

  summaryData.forEach((item, idx) => {
    const row = summarySheet.addRow(item);
    applyDataRowStyles(row, idx % 2 === 1);
  });

  // Extra metadata block
  summarySheet.addRow({});
  const metaHeader = summarySheet.addRow({
    category: 'EXPORT METADATA',
    count: 'SYSTEM STATE',
    notes: 'VALUE',
  });
  metaHeader.eachCell((c) => {
    c.font = { bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  });

  summarySheet.addRow({ category: 'Database Name', count: mongoose.connection.name, notes: 'Configured MongoDB Database' });
  summarySheet.addRow({ category: 'Export Timestamp (ISO)', count: new Date().toISOString(), notes: 'Live database snapshot' });
  summarySheet.addRow({ category: 'Target Priority 1 Company', count: 'Kevit Technologies', notes: 'Rank #1 in company directory' });
  summarySheet.addRow({ category: 'Target Priority 2 Company', count: 'TSS Consultancy Private Limited', notes: 'Rank #2 in company directory' });
  summarySheet.addRow({ category: 'Target Priority 3 Company', count: 'RKIT Software Pvt Ltd', notes: 'Rank #3 in company directory' });
  summarySheet.addRow({ category: 'Target Priority 4 Company', count: 'GN Websoft', notes: 'Rank #4 in company directory' });

  // -------------------------------------------------------------
  // WORKSHEET 2: COMPANIES
  // -------------------------------------------------------------
  const companiesSheet = workbook.addWorksheet('Companies');
  applyHeaderStyles(companiesSheet, [
    { header: 'Company Name', key: 'name', width: 32 },
    { header: 'Aliases / Alternate Titles', key: 'aliases', width: 35 },
    { header: 'Placement Seasons', key: 'years', width: 20 },
    { header: 'Experiences Count', key: 'expCount', width: 18 },
    { header: 'Official Website', key: 'website', width: 28 },
    { header: 'Logo Asset Reference', key: 'logoUrl', width: 26 },
    { header: 'Publication Status', key: 'isPublished', width: 18 },
    { header: 'Needs Review', key: 'needsReview', width: 16 },
    { header: 'Review Notes', key: 'reviewNotes', width: 45 },
    { header: 'Company Overview / About', key: 'about', width: 50 },
    { header: 'General Candidate Advice', key: 'advice', width: 60 },
  ]);

  companies.forEach((c, idx) => {
    const row = companiesSheet.addRow({
      name: c.name,
      aliases: (c.aliases || []).join(', '),
      years: (c.placementYears || []).join(', ') || 'Recorded',
      expCount: c.totalExperiencesCount || 0,
      website: c.website || '—',
      logoUrl: c.logoUrl || 'Neutral Fallback',
      isPublished: c.isPublished ? 'Published' : 'Draft / Unpublished',
      needsReview: c.needsReview ? 'Yes (Action Required)' : 'No',
      reviewNotes: c.reviewNotes || '—',
      about: c.about || '—',
      advice: (c.generalAdvice || []).join('\n• ') ? '• ' + (c.generalAdvice || []).join('\n• ') : '—',
    });
    applyDataRowStyles(row, idx % 2 === 1);
  });

  // -------------------------------------------------------------
  // WORKSHEET 3: INTERVIEW EXPERIENCES
  // -------------------------------------------------------------
  const expSheet = workbook.addWorksheet('Experiences');
  applyHeaderStyles(expSheet, [
    { header: 'Company Name', key: 'company', width: 30 },
    { header: 'Role / Profile', key: 'role', width: 28 },
    { header: 'Placement Season', key: 'year', width: 18 },
    { header: 'Total Rounds', key: 'totalRounds', width: 15 },
    { header: 'Source Document', key: 'sourceDoc', width: 26 },
    { header: 'Source Page / Section', key: 'sourcePage', width: 22 },
    { header: 'Process Overview', key: 'overview', width: 55 },
    { header: 'Candidate Advice', key: 'advice', width: 55 },
    { header: 'Alumni Solutions / GitHub', key: 'solutions', width: 40 },
  ]);

  experiences.forEach((e, idx) => {
    const solText = (e.alumniContributions || [])
      .map((c) => `${c.name}: ${c.githubUrl || ''} (${c.notes || ''})`)
      .join('\n');

    const row = expSheet.addRow({
      company: e.company?.name || 'Unknown Company',
      role: e.role || 'Software Engineer',
      year: e.placementYear ? `Season ${e.placementYear}` : 'Placement Archive',
      totalRounds: e.totalRoundsCount || 0,
      sourceDoc: e.sourceDocument || '—',
      sourcePage: e.sourcePage || '—',
      overview: e.processOverview || '—',
      advice: (e.advice || []).join('\n• ') ? '• ' + (e.advice || []).join('\n• ') : '—',
      solutions: solText || '—',
    });
    applyDataRowStyles(row, idx % 2 === 1);
  });

  // -------------------------------------------------------------
  // WORKSHEET 4: INTERVIEW ROUNDS
  // -------------------------------------------------------------
  const roundsSheet = workbook.addWorksheet('Interview Rounds');
  applyHeaderStyles(roundsSheet, [
    { header: 'Company Name', key: 'company', width: 30 },
    { header: 'Round Number', key: 'roundNum', width: 15 },
    { header: 'Round Title', key: 'title', width: 32 },
    { header: 'Round Classification', key: 'type', width: 22 },
    { header: 'Candidate Role / Profile', key: 'role', width: 26 },
    { header: 'Season Year', key: 'year', width: 15 },
    { header: 'Topics Covered', key: 'topics', width: 35 },
    { header: 'Round Strategy & Advice', key: 'advice', width: 45 },
    { header: 'Source Document', key: 'sourceDoc', width: 25 },
  ]);

  rounds.forEach((r, idx) => {
    const row = roundsSheet.addRow({
      company: r.company?.name || 'Unknown Company',
      roundNum: `Round ${r.roundNumber || 1}`,
      title: r.title,
      type: r.roundType || 'Technical Round',
      role: r.experience?.role || '—',
      year: r.experience?.placementYear ? `Season ${r.experience.placementYear}` : 'Archive',
      topics: (r.topicsCovered || []).join(', ') || '—',
      advice: (r.keyAdvice || []).join('\n• ') ? '• ' + (r.keyAdvice || []).join('\n• ') : '—',
      sourceDoc: r.sourceDocument || '—',
    });
    applyDataRowStyles(row, idx % 2 === 1);
  });

  // -------------------------------------------------------------
  // WORKSHEET 5: QUESTIONS & TOPICS
  // -------------------------------------------------------------
  const questionsSheet = workbook.addWorksheet('Questions & Topics');
  applyHeaderStyles(questionsSheet, [
    { header: 'Company Name', key: 'company', width: 28 },
    { header: 'Round Title', key: 'roundTitle', width: 28 },
    { header: 'Round Type', key: 'roundType', width: 20 },
    { header: 'Interview Question / Problem Statement', key: 'text', width: 65 },
    { header: 'Category / Domain', key: 'category', width: 24 },
    { header: 'Difficulty', key: 'difficulty', width: 15 },
    { header: 'Expected Solution / Approach Notes', key: 'approach', width: 45 },
    { header: 'Source Document', key: 'sourceDoc', width: 24 },
  ]);

  questions.forEach((q, idx) => {
    const row = questionsSheet.addRow({
      company: q.company?.name || 'General Placement',
      roundTitle: q.round?.title || 'Interview Round',
      roundType: q.round?.roundType || 'Technical Round',
      text: q.text,
      category: q.category || 'General CS',
      difficulty: q.difficulty || 'Medium',
      approach: q.approachNotes || q.sampleAnswer || '—',
      sourceDoc: q.sourceDocument || '—',
    });
    applyDataRowStyles(row, idx % 2 === 1);
  });

  // -------------------------------------------------------------
  // WORKSHEET 6: ALUMNI
  // -------------------------------------------------------------
  const alumniSheet = workbook.addWorksheet('Alumni');
  applyHeaderStyles(alumniSheet, [
    { header: 'Alumnus Name', key: 'name', width: 28 },
    { header: 'Associated Company', key: 'company', width: 30 },
    { header: 'Professional Role / Job Title', key: 'jobTitle', width: 30 },
    { header: 'LinkedIn Profile URL', key: 'linkedin', width: 40 },
    { header: 'Profile Photo Status', key: 'photoStatus', width: 25 },
    { header: 'Company Logo Reference', key: 'logo', width: 25 },
    { header: 'Featured Priority', key: 'isFeatured', width: 18 },
    { header: 'Publication Status', key: 'isPublished', width: 18 },
  ]);

  alumniList.forEach((a, idx) => {
    const row = alumniSheet.addRow({
      name: a.name,
      company: a.companyName,
      jobTitle: a.jobTitle || 'Graduate',
      linkedin: a.linkedinUrl,
      photoStatus: a.profilePhoto ? a.profilePhoto : 'Neutral Avatar Placeholder',
      logo: a.companyLogo || 'Auto-resolved',
      isFeatured: a.isFeatured ? `Featured (Rank ${a.featuredOrder || 1})` : 'Standard',
      isPublished: a.isPublished ? 'Published' : 'Draft',
    });
    applyDataRowStyles(row, idx % 2 === 1);
  });

  // -------------------------------------------------------------
  // WORKSHEET 7: LEARNING MATERIALS
  // -------------------------------------------------------------
  const materialsSheet = workbook.addWorksheet('Learning Materials');
  applyHeaderStyles(materialsSheet, [
    { header: 'Resource Title', key: 'title', width: 38 },
    { header: 'Category', key: 'category', width: 28 },
    { header: 'Company Scope', key: 'company', width: 24 },
    { header: 'File Type', key: 'fileType', width: 15 },
    { header: 'File Name', key: 'fileName', width: 28 },
    { header: 'Size (KB)', key: 'size', width: 15 },
    { header: 'File / Resource URL', key: 'fileUrl', width: 38 },
    { header: 'Description', key: 'description', width: 50 },
    { header: 'Publication Status', key: 'isPublished', width: 18 },
  ]);

  learningMaterials.forEach((m, idx) => {
    const row = materialsSheet.addRow({
      title: m.title,
      category: m.category,
      company: m.companyName || 'General Placement',
      fileType: m.fileType || 'PDF',
      fileName: m.fileName || '—',
      size: m.fileSize ? Math.round(m.fileSize / 1024) : '—',
      fileUrl: m.fileUrl || m.externalUrl || '—',
      description: m.description || '—',
      isPublished: m.isPublished ? 'Published' : 'Draft',
    });
    applyDataRowStyles(row, idx % 2 === 1);
  });

  // -------------------------------------------------------------
  // WORKSHEET 8: DATA REVIEW & QUALITY AUDIT
  // -------------------------------------------------------------
  const reviewSheet = workbook.addWorksheet('Data Review');
  applyHeaderStyles(reviewSheet, [
    { header: 'Item Type', key: 'type', width: 18 },
    { header: 'Record Identifier / Title', key: 'name', width: 38 },
    { header: 'Issue Description', key: 'issue', width: 45 },
    { header: 'Administrative Review Notes / Recommended Action', key: 'notes', width: 60 },
  ]);

  // Flagged companies or unassigned sections
  const flaggedCompanies = companies.filter((c) => c.needsReview || c.name.startsWith('['));
  flaggedCompanies.forEach((c, idx) => {
    const row = reviewSheet.addRow({
      type: 'Company Record',
      name: c.name,
      issue: 'Company header omitted in source document or flagged for manual review',
      notes: c.reviewNotes || 'Verify with placement cell records and merge into canonical company if identified',
    });
    applyDataRowStyles(row, idx % 2 === 1);
  });

  // Companies without websites
  const noWebsiteCompanies = companies.filter((c) => !c.website && !c.needsReview);
  noWebsiteCompanies.forEach((c, idx) => {
    const row = reviewSheet.addRow({
      type: 'Company Website',
      name: c.name,
      issue: 'No official corporate website URL recorded',
      notes: 'Supply verified corporate URL in Admin Dashboard',
    });
    applyDataRowStyles(row, (flaggedCompanies.length + idx) % 2 === 1);
  });

  // Alumni photo review
  alumniList.forEach((a, idx) => {
    if (!a.profilePhoto) {
      const row = reviewSheet.addRow({
        type: 'Alumni Photo',
        name: `${a.name} (${a.companyName})`,
        issue: 'No personal profile photo configured; currently displaying clean neutral avatar placeholder',
        notes: 'In compliance with LinkedIn TOS (no automated scraping), provide approved alumnus photo via Admin Dashboard or keep neutral avatar placeholder. Never use company logo.',
      });
      applyDataRowStyles(row, idx % 2 === 1);
    }
  });

  // Save Workbook to Private Location
  const outputFileName = 'GECR_Placement_Sarthi_Current_Data.xlsx';
  const outputPath = path.resolve(__dirname, '..', '..', outputFileName);

  await workbook.xlsx.writeFile(outputPath);
  console.log('====================================================');
  console.log(`EXCEL WORKBOOK GENERATED SUCCESSFULLY!`);
  console.log(`Saved to private location: ${outputPath}`);
  console.log('Worksheets included:');
  console.log('  1. Summary');
  console.log('  2. Companies');
  console.log('  3. Experiences');
  console.log('  4. Interview Rounds');
  console.log('  5. Questions & Topics');
  console.log('  6. Alumni');
  console.log('  7. Learning Materials');
  console.log('  8. Data Review');
  console.log('====================================================');

  await mongoose.disconnect();
}

if (require.main === module) {
  exportDatabaseToExcel().catch((err) => {
    console.error('Fatal error generating Excel workbook:', err);
    process.exit(1);
  });
}

module.exports = { exportDatabaseToExcel };
