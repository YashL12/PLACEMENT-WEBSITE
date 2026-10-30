/**
 * Import script: Placement_Coding_SQL_Question_Bank_5000.xlsx
 *
 * Maps Excel schema → CodingQuestion Mongoose model.
 * Safe to re-run: uses slug-based upsert (no duplicates).
 *
 * Usage:
 *   node scripts/import-excel-questions.js [--dry-run] [--file <path>]
 *
 * Excel columns: ID | Question | Type | Category | Difficulty | Company | Platform | Solution Link
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const XLSX = require('xlsx');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const CodingQuestion = require('../src/models/CodingQuestion');

const isDryRun = process.argv.includes('--dry-run');
const fileArgIdx = process.argv.indexOf('--file');
const EXCEL_PATH =
  fileArgIdx !== -1 && process.argv[fileArgIdx + 1]
    ? process.argv[fileArgIdx + 1]
    : path.join(__dirname, '..', '..', 'Placement_Coding_SQL_Question_Bank_5000 (1).xlsx');

// ─── Category Mappings ────────────────────────────────────────────────────────

const CODING_CATEGORY_MAP = {
  // Direct matches
  arrays: 'Arrays',
  array: 'Arrays',
  strings: 'Strings',
  string: 'Strings',
  hashing: 'Hashing',
  'searching and sorting': 'Searching and Sorting',
  'search and sort': 'Searching and Sorting',
  'searching & sorting': 'Searching and Sorting',
  'linked lists': 'Linked Lists',
  'linked list': 'Linked Lists',
  'stacks and queues': 'Stacks and Queues',
  'stack and queue': 'Stacks and Queues',
  'stacks & queues': 'Stacks and Queues',
  stacks: 'Stacks and Queues',
  queues: 'Stacks and Queues',
  trees: 'Trees',
  tree: 'Trees',
  graphs: 'Graphs',
  graph: 'Graphs',
  'dynamic programming': 'Dynamic Programming',
  dp: 'Dynamic Programming',
  'recursion and backtracking': 'Recursion and Backtracking',
  'recursion & backtracking': 'Recursion and Backtracking',
  recursion: 'Recursion and Backtracking',
  backtracking: 'Recursion and Backtracking',
  'bit manipulation': 'Bit Manipulation',
  'greedy algorithms': 'Greedy Algorithms',
  'greedy and intervals': 'Greedy Algorithms',
  greedy: 'Greedy Algorithms',
  matrices: 'Matrices',
  matrix: 'Matrices',
  'heaps and priority queues': 'Heaps and Priority Queues',
  'heaps & priority queues': 'Heaps and Priority Queues',
  heaps: 'Heaps and Priority Queues',
  'priority queues': 'Heaps and Priority Queues',
  // Fuzzy / less common
  'programming fundamentals': 'Other Coding Topics',
  implementation: 'Other Coding Topics',
  patterns: 'Other Coding Topics',
  'concurrency and data structures': 'Other Coding Topics',
  sql: 'Other Coding Topics', // shouldn't happen but guard
};

const SQL_CATEGORY_MAP = {
  'select and filtering': 'SELECT and Filtering',
  'filtering and ordering': 'SELECT and Filtering',
  'select': 'SELECT and Filtering',
  filtering: 'SELECT and Filtering',
  joins: 'Joins',
  join: 'Joins',
  'anti-join': 'Joins',
  aggregation: 'Aggregation',
  'conditional aggregation': 'Aggregation',
  'percent contribution': 'Aggregation',
  'group by and having': 'GROUP BY and HAVING',
  'group by & having': 'GROUP BY and HAVING',
  having: 'GROUP BY and HAVING',
  subqueries: 'Subqueries',
  subquery: 'Subqueries',
  'common table expressions': 'Common Table Expressions',
  cte: 'Common Table Expressions',
  'window functions': 'Window Functions',
  ranking: 'Ranking',
  'second-highest / nth value': 'Ranking',
  'top-n per group': 'Ranking',
  'duplicate detection': 'Duplicate Detection',
  duplicates: 'Duplicate Detection',
  deduplication: 'Duplicate Detection',
  'date and time queries': 'Date and Time Queries',
  'date analysis': 'Date and Time Queries',
  'null handling': 'NULL Handling',
  'data modification': 'Data Modification',
  'query optimization': 'Query Optimization',
  'running total': 'Window Functions',
  'previous/next row': 'Window Functions',
  'median/percentile': 'Window Functions',
  sessionization: 'Other SQL Topics',
  'gaps and islands': 'Other SQL Topics',
};

function mapCategory(rawType, rawCategory) {
  const typeNorm = (rawType || '').toLowerCase().trim();
  const catNorm = (rawCategory || '').toLowerCase().trim();

  if (typeNorm === 'sql') {
    return SQL_CATEGORY_MAP[catNorm] || 'Other SQL Topics';
  } else {
    return CODING_CATEGORY_MAP[catNorm] || 'Other Coding Topics';
  }
}

// ─── Slug helpers ─────────────────────────────────────────────────────────────

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function makeSlug(id, question) {
  const base = slugify(question).slice(0, 60);
  const idPart = (id || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  return `${idPart ? idPart + '-' : ''}${base}`.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ─── Platform normalisation ────────────────────────────────────────────────────

function normalisePlatform(raw) {
  if (!raw) return 'LeetCode';
  const r = raw.toString().trim();
  // "LeetCode / HackerRank" → pick first
  const first = r.split(/[\/,;]/)[0].trim();
  if (/leetcode/i.test(first)) return 'LeetCode';
  if (/geeksforgeeks|gfg/i.test(first)) return 'GeeksforGeeks';
  if (/hackerrank/i.test(first)) return 'HackerRank';
  if (/sqlbolt/i.test(first)) return 'SQLBolt';
  if (/codestudio|coding ninjas/i.test(first)) return 'CodeStudio';
  return first || 'LeetCode';
}

// ─── Company normalisation ─────────────────────────────────────────────────────

function normaliseCompanies(raw) {
  if (!raw) return [];
  return raw
    .toString()
    .split(/[;,\/]/)
    .map((c) => c.trim())
    .filter(Boolean);
}

// ─── Difficulty normalisation ─────────────────────────────────────────────────

function normaliseDifficulty(raw) {
  const d = (raw || '').toString().trim();
  if (/easy/i.test(d)) return 'Easy';
  if (/hard/i.test(d)) return 'Hard';
  return 'Medium';
}

// ─── Type normalisation ────────────────────────────────────────────────────────

function normaliseType(raw) {
  const t = (raw || '').toString().trim().toLowerCase();
  if (t === 'sql') return 'SQL';
  return 'Coding';
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  GECR Placement — Excel Question Import Script');
  console.log('═══════════════════════════════════════════════════════\n');

  if (isDryRun) {
    console.log('⚠  DRY-RUN mode: no writes will be made.\n');
  }

  // 1. Read Excel
  console.log(`📂 Reading Excel: ${EXCEL_PATH}`);
  let wb;
  try {
    wb = XLSX.readFile(EXCEL_PATH);
  } catch (err) {
    console.error('❌ Failed to read Excel file:', err.message);
    process.exit(1);
  }

  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const headers = raw[0]; // ['ID', 'Question', 'Type', 'Category', 'Difficulty', 'Company', 'Platform', 'Solution Link']
  const dataRows = raw.slice(1);

  console.log(`✅ Loaded sheet "${sheetName}" — ${dataRows.length} data rows\n`);

  // 2. Connect DB
  if (!isDryRun) {
    await connectDB();
    console.log('✅ MongoDB connected\n');
  }

  // 3. Process rows
  const stats = {
    total: dataRows.length,
    imported: 0,
    updated: 0,
    skipped: 0,
    flagged: 0,
    errors: 0,
  };

  const flagged = [];
  const BATCH_SIZE = 200;
  let batch = [];

  const flushBatch = async () => {
    if (batch.length === 0) return;

    for (const doc of batch) {
      try {
        const existing = await CodingQuestion.findOne({ slug: doc.slug });
        if (existing) {
          // Already exists — skip (idempotent)
          stats.skipped++;
        } else {
          if (!isDryRun) {
            await CodingQuestion.create(doc);
          }
          stats.imported++;
        }
      } catch (err) {
        console.error(`  ❌ Error on slug "${doc.slug}": ${err.message}`);
        stats.errors++;
      }
    }
    batch = [];
  };

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2; // 1-indexed + header

    const rawId = (row[0] || '').toString().trim();
    const rawQuestion = (row[1] || '').toString().trim();
    const rawType = (row[2] || '').toString().trim();
    const rawCategory = (row[3] || '').toString().trim();
    const rawDifficulty = (row[4] || '').toString().trim();
    const rawCompany = (row[5] || '').toString().trim();
    const rawPlatform = (row[6] || '').toString().trim();
    const rawLink = (row[7] || '').toString().trim();

    // Skip blank rows
    if (!rawQuestion) {
      stats.skipped++;
      continue;
    }

    const type = normaliseType(rawType);
    const category = mapCategory(rawType, rawCategory);
    const difficulty = normaliseDifficulty(rawDifficulty);
    const platform = normalisePlatform(rawPlatform);
    const companies = normaliseCompanies(rawCompany);
    const externalUrl = rawLink && /^https?:\/\//.test(rawLink) ? rawLink : '';

    // Flag uncertain classifications
    const originalCatNorm = rawCategory.toLowerCase().trim();
    const isFlagged =
      (type === 'Coding' && !CODING_CATEGORY_MAP[originalCatNorm]) ||
      (type === 'SQL' && !SQL_CATEGORY_MAP[originalCatNorm]);

    if (isFlagged) {
      flagged.push({ rowNum, id: rawId, question: rawQuestion, rawCategory, mappedCategory: category });
    }

    const slug = makeSlug(rawId, rawQuestion);

    const doc = {
      slug,
      title: rawQuestion,
      // Map Type to category field in schema
      category: type === 'SQL' ? 'SQL' : 'DSA',
      // Use topic field for the sub-category
      topic: category,
      difficulty,
      statement: rawQuestion,
      platform,
      externalUrl,
      companyTags: companies,
      companyTagSource: companies.length > 0 ? 'company-pattern' : 'company-pattern',
      interviewContext: rawId ? `Excel import reference: ${rawId}` : '',
      source: 'excel-import',
      isPublished: true,
      sortOrder: i,
    };

    batch.push(doc);

    if (batch.length >= BATCH_SIZE) {
      if (!isDryRun) {
        await flushBatch();
      } else {
        stats.imported += batch.length;
        batch = [];
      }

      const pct = Math.round(((i + 1) / dataRows.length) * 100);
      process.stdout.write(`\r  Progress: ${i + 1}/${dataRows.length} (${pct}%)  `);
    }
  }

  // Flush remainder
  if (!isDryRun) {
    await flushBatch();
  } else {
    stats.imported += batch.length;
    batch = [];
  }

  console.log('\n');

  // 4. Report
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Import Report');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Total rows processed : ${stats.total}`);
  console.log(`  Imported (new)       : ${stats.imported}`);
  console.log(`  Skipped (duplicate)  : ${stats.skipped}`);
  console.log(`  Errors               : ${stats.errors}`);
  console.log(`  Flagged for review   : ${flagged.length}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (flagged.length > 0) {
    console.log('⚠  Flagged questions (uncertain category mapping):');
    flagged.slice(0, 30).forEach((f) => {
      console.log(`  Row ${f.rowNum} [${f.id}] "${f.question.slice(0, 60)}..." rawCat="${f.rawCategory}" → "${f.mappedCategory}"`);
    });
    if (flagged.length > 30) {
      console.log(`  ... and ${flagged.length - 30} more.`);
    }
    console.log('');
  }

  if (!isDryRun) {
    const total = await CodingQuestion.countDocuments({ isPublished: true });
    console.log(`📊 Total questions in DB now: ${total}\n`);
    await mongoose.disconnect();
  }

  console.log('✅ Import complete!\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
