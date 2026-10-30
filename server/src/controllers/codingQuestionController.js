const mongoose = require('mongoose');
const CodingQuestion = require('../models/CodingQuestion');
const { serverCache } = require('../utils/cache');

// ─── Static reference data ────────────────────────────────────────────────────
const CATEGORIES = ['DSA', 'SQL', 'General Programming'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// Canonical coding sub-categories (topics)
const CODING_TOPICS = [
  'Arrays',
  'Strings',
  'Hashing',
  'Searching and Sorting',
  'Linked Lists',
  'Stacks and Queues',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Recursion and Backtracking',
  'Bit Manipulation',
  'Greedy Algorithms',
  'Matrices',
  'Heaps and Priority Queues',
  'Other Coding Topics',
  // Legacy topics from existing seed
  'Array',
  'String',
  'Linked List',
  'Stack',
  'Queue',
  'Tree',
  'Graph',
];

// Canonical SQL sub-categories (topics)
const SQL_TOPICS = [
  'SELECT and Filtering',
  'Joins',
  'Aggregation',
  'GROUP BY and HAVING',
  'Subqueries',
  'Common Table Expressions',
  'Window Functions',
  'Ranking',
  'Duplicate Detection',
  'Date and Time Queries',
  'NULL Handling',
  'Data Modification',
  'Query Optimization',
  'Other SQL Topics',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a safe MongoDB filter from validated query params.
 * Only published questions are shown publicly.
 */
function buildFilter(query) {
  const filter = { isPublished: true };

  // Category filter (DSA / SQL / General Programming)
  if (query.category && query.category !== 'All') {
    if (CATEGORIES.includes(query.category)) {
      filter.category = query.category;
    }
  }

  // Topic / sub-category filter
  if (query.topic && query.topic !== 'All' && query.topic !== '') {
    const raw = query.topic.trim();
    filter.topic = { $regex: new RegExp(`^${raw.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}$`, 'i') };
  }

  // Difficulty filter
  if (query.difficulty && query.difficulty !== 'All' && DIFFICULTIES.includes(query.difficulty)) {
    filter.difficulty = query.difficulty;
  }

  // Company filter
  if (query.company && typeof query.company === 'string' && query.company.trim() && query.company !== 'All') {
    filter.companyTags = { $in: [query.company.trim()] };
  }

  // Platform filter
  if (query.platform && typeof query.platform === 'string' && query.platform.trim() && query.platform !== 'All') {
    filter.platform = query.platform.trim();
  }

  // Has external URL filter
  if (query.hasSolution === 'true') {
    filter.externalUrl = { $exists: true, $ne: '' };
  } else if (query.hasSolution === 'false') {
    filter.$or = [{ externalUrl: { $exists: false } }, { externalUrl: '' }];
  }

  // Text search
  if (query.search && typeof query.search === 'string' && query.search.trim()) {
    const searchTerm = query.search.trim();
    // Use regex search on title since text index may not cover all imported questions
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { topic: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  return filter;
}

/**
 * Build sort object from query params.
 */
function buildSort(query) {
  const { sort = 'difficulty-asc' } = query;

  switch (sort) {
    case 'difficulty-asc':
      return { difficultyRank: 1, sortOrder: 1, title: 1 };
    case 'difficulty-desc':
      return { difficultyRank: -1, sortOrder: 1, title: 1 };
    case 'title-asc':
      return { title: 1 };
    case 'title-desc':
      return { title: -1 };
    case 'newest':
      return { createdAt: -1 };
    case 'oldest':
      return { createdAt: 1 };
    default:
      return { difficultyRank: 1, sortOrder: 1, title: 1 };
  }
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/coding-questions
 * Returns paginated question directory cards.
 */
const getCodingQuestions = async (req, res, next) => {
  try {
    const { page = '1', limit = '20', ...rest } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = buildFilter(rest);
    const sort = buildSort(rest);

    // List projection — lightweight summary for directory cards
    const projection = {
      slug: 1,
      title: 1,
      category: 1,
      topic: 1,
      difficulty: 1,
      companyTags: 1,
      companyTagSource: 1,
      platform: 1,
      externalUrl: 1,
      interviewContext: 1,
      difficultyRank: 1,
      sortOrder: 1,
      createdAt: 1,
    };

    // Run count and data queries in parallel
    const [total, questions] = await Promise.all([
      CodingQuestion.countDocuments(filter),
      CodingQuestion.find(filter, projection).sort(sort).skip(skip).limit(limitNum).lean(),
    ]);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
          hasMore: skip + questions.length < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/coding-questions/meta
 * Returns category/topic/company/platform reference data + total count.
 */
const getCodingMeta = async (req, res, next) => {
  try {
    const cacheKey = 'coding:meta';
    const cached = serverCache.get(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(cached);
    }

    const [totalCount, codingCount, sqlCount, companies, platforms, topics] = await Promise.all([
      CodingQuestion.countDocuments({ isPublished: true }),
      CodingQuestion.countDocuments({ isPublished: true, category: 'DSA' }),
      CodingQuestion.countDocuments({ isPublished: true, category: 'SQL' }),
      CodingQuestion.distinct('companyTags', { isPublished: true }),
      CodingQuestion.distinct('platform', { isPublished: true }),
      CodingQuestion.distinct('topic', { isPublished: true }),
    ]);

    const payload = {
      success: true,
      data: {
        categories: CATEGORIES,
        codingTopics: CODING_TOPICS,
        sqlTopics: SQL_TOPICS,
        allTopics: topics.filter(Boolean).sort(),
        difficulties: DIFFICULTIES,
        companies: companies.filter(Boolean).sort(),
        platforms: platforms.filter(Boolean).sort(),
        totalCount,
        codingCount,
        sqlCount,
      },
    };

    serverCache.set(cacheKey, payload, 5 * 60 * 1000); // 5 min TTL
    res.set('Cache-Control', 'public, max-age=300');
    res.json(payload);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/coding-questions/stats
 * Returns aggregate stats for the dashboard.
 */
const getCodingStats = async (req, res, next) => {
  try {
    const cacheKey = 'coding:stats';
    const cached = serverCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const [byDifficulty, byCategory, byTopic, totalCount] = await Promise.all([
      CodingQuestion.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
      CodingQuestion.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      CodingQuestion.aggregate([
        { $match: { isPublished: true, topic: { $exists: true, $ne: '' } } },
        { $group: { _id: '$topic', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      CodingQuestion.countDocuments({ isPublished: true }),
    ]);

    const diffMap = { Easy: 0, Medium: 0, Hard: 0 };
    byDifficulty.forEach((d) => {
      if (d._id) diffMap[d._id] = d.count;
    });

    const catMap = { DSA: 0, SQL: 0, 'General Programming': 0 };
    byCategory.forEach((c) => {
      if (c._id) catMap[c._id] = c.count;
    });

    const payload = {
      success: true,
      data: {
        total: totalCount,
        byDifficulty: diffMap,
        byCategory: catMap,
        topTopics: byTopic.map((t) => ({ topic: t._id, count: t.count })),
      },
    };

    serverCache.set(cacheKey, payload, 5 * 60 * 1000);
    res.json(payload);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/coding-questions/:slug
 * Returns full question detail including examples and sample test cases.
 * Excludes solutions — those are fetched separately.
 */
const getCodingQuestionBySlug = async (req, res, next) => {
  try {
    const rawSlug = req.params.slug;
    if (!rawSlug || typeof rawSlug !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid question identifier' });
    }

    let decoded = rawSlug;
    try {
      decoded = decodeURIComponent(rawSlug).trim();
    } catch (e) {
      decoded = rawSlug.trim();
    }

    const query = { isPublished: true };
    if (mongoose.Types.ObjectId.isValid(decoded) && decoded.length === 24) {
      query.$or = [{ slug: decoded.toLowerCase() }, { _id: decoded }];
    } else {
      query.slug = decoded.toLowerCase();
    }

    const question = await CodingQuestion.findOne(query, { solutions: 0 }).lean();

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Never leak Excel references in interviewContext
    if (question.interviewContext && /excel/i.test(question.interviewContext)) {
      question.interviewContext = '';
    }

    // Fetch adjacent questions for prev/next navigation
    const [prevQ, nextQ] = await Promise.all([
      CodingQuestion.findOne(
        {
          isPublished: true,
          category: question.category,
          $or: [
            { difficultyRank: { $lt: question.difficultyRank } },
            { difficultyRank: question.difficultyRank, sortOrder: { $lt: question.sortOrder } },
          ],
        },
        { slug: 1, title: 1, difficulty: 1 }
      )
        .sort({ difficultyRank: -1, sortOrder: -1 })
        .lean(),
      CodingQuestion.findOne(
        {
          isPublished: true,
          category: question.category,
          $or: [
            { difficultyRank: { $gt: question.difficultyRank } },
            { difficultyRank: question.difficultyRank, sortOrder: { $gt: question.sortOrder } },
          ],
        },
        { slug: 1, title: 1, difficulty: 1 }
      )
        .sort({ difficultyRank: 1, sortOrder: 1 })
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        ...question,
        navigation: {
          prev: prevQ ? { slug: prevQ.slug, title: prevQ.title, difficulty: prevQ.difficulty } : null,
          next: nextQ ? { slug: nextQ.slug, title: nextQ.title, difficulty: nextQ.difficulty } : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/coding-questions/:slug/solution?lang=java|javascript|python
 */
const getCodingQuestionSolution = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { lang } = req.query;

    const validLangs = ['java', 'javascript', 'python'];
    if (!lang || !validLangs.includes(lang)) {
      return res.status(400).json({ success: false, message: 'lang must be java, javascript, or python' });
    }

    const question = await CodingQuestion.findOne(
      { slug: slug.toLowerCase(), isPublished: true },
      { [`solutions.${lang}`]: 1, category: 1 }
    ).lean();

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const solution = question.solutions?.[lang] || '';
    res.json({ success: true, data: { lang, solution } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCodingQuestions,
  getCodingMeta,
  getCodingStats,
  getCodingQuestionBySlug,
  getCodingQuestionSolution,
  // Export constants for use in seed script
  CATEGORIES,
  CODING_TOPICS,
  SQL_TOPICS,
  DIFFICULTIES,
};
