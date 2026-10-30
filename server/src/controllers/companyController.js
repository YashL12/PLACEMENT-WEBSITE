const Company = require('../models/Company');
const InterviewExperience = require('../models/InterviewExperience');
const InterviewRound = require('../models/InterviewRound');
const Question = require('../models/Question');
const CodingQuestion = require('../models/CodingQuestion');
const { serverCache } = require('../utils/cache');

// Helper to invalidate all company-related caches
const invalidateCompanyCaches = () => {
  serverCache.invalidatePrefix('companies');
  serverCache.invalidatePrefix('company:');
  serverCache.invalidatePrefix('stats:');
};

// @desc    Get all companies (public listing) with search, alias matching, year filtering, pagination
// @route   GET /api/companies
// @access  Public
const getCompanies = async (req, res, next) => {
  try {
    const {
      search = '',
      year,
      sort = 'name',
      page = 1,
      limit = 12,
      includeUnpublished = 'false',
    } = req.query;

    const cacheKey = `companies:${search}:${year || ''}:${sort}:${page}:${limit}:${includeUnpublished}`;
    const cachedResponse = serverCache.get(cacheKey);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const query = {};

    // Filter by publication status unless requested by admin
    if (includeUnpublished !== 'true') {
      query.isPublished = true;
    }

    // Year filtering
    if (year && !isNaN(parseInt(year, 10))) {
      query.placementYears = parseInt(year, 10);
    }

    // Search filter: case-insensitive name or alias matching
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { normalizedName: searchRegex },
        { aliases: searchRegex },
      ];
    }

    // Mandatory priority ordering expression:
    // 1. Kevit
    // 2. TSS
    // 3. RKIT
    // 4. GN Websoft
    // 5. All other companies afterward
    const prioritySwitch = {
      $switch: {
        branches: [
          {
            case: {
              $regexMatch: { input: '$normalizedName', regex: /^kevit/i },
            },
            then: 1,
          },
          {
            case: {
              $or: [
                { $regexMatch: { input: '$normalizedName', regex: /^tss/i } },
                { $in: ['TSS', '$aliases'] },
              ],
            },
            then: 2,
          },
          {
            case: {
              $or: [
                { $regexMatch: { input: '$normalizedName', regex: /^rkit/i } },
                { $in: ['RKIT', '$aliases'] },
              ],
            },
            then: 3,
          },
          {
            case: {
              $or: [
                { $regexMatch: { input: '$normalizedName', regex: /^gn websoft/i } },
                { $in: ['GN websoft', '$aliases'] },
              ],
            },
            then: 4,
          },
        ],
        default: 999,
      },
    };

    // Sorting options with priorityOrder taking primary precedence
    let sortStage = { priorityOrder: 1, name: 1 };
    if (sort === 'name_desc') {
      sortStage = { priorityOrder: 1, name: -1 };
    } else if (sort === 'experiences') {
      sortStage = { priorityOrder: 1, totalExperiencesCount: -1, name: 1 };
    } else if (sort === 'newest') {
      sortStage = { priorityOrder: 1, createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
      { $match: query },
      { $addFields: { priorityOrder: prioritySwitch } },
      { $sort: sortStage },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limitNum }],
        },
      },
    ];

    const [result] = await Company.aggregate(pipeline);
    const total = result?.metadata[0]?.total || 0;
    const companies = result?.data || [];

    const responsePayload = {
      success: true,
      data: {
        companies,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    };

    // Cache list results for 30 seconds
    serverCache.set(cacheKey, responsePayload, 30 * 1000);

    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// @desc    Get company details by ID or normalized name with its experiences, rounds, and questions
// @route   GET /api/companies/:id
// @access  Public
const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { includeUnpublished = 'false' } = req.query;

    const cacheKey = `company:${id}:${includeUnpublished}`;
    const cachedResponse = serverCache.get(cacheKey);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    let company;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      company = await Company.findById(id).lean();
    } else {
      company = await Company.findOne({
        $or: [
          { normalizedName: id.toLowerCase() },
          { aliases: new RegExp(`^${id}$`, 'i') },
        ],
      }).lean();
    }

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Public check
    if (!company.isPublished && includeUnpublished !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'This company record is currently awaiting review or publication',
      });
    }

    // Fetch related interview experiences
    const expQuery = { company: company._id };
    if (includeUnpublished !== 'true') {
      expQuery.isPublished = true;
    }

    const experiences = await InterviewExperience.find(expQuery)
      .sort({ placementYear: -1, order: 1, createdAt: 1 })
      .lean();

    // Batch query rounds and questions — fixes N+1 DB query bottleneck
    const expIds = experiences.map((exp) => exp._id);
    const roundQuery = { experience: { $in: expIds } };
    if (includeUnpublished !== 'true') {
      roundQuery.isPublished = true;
    }

    const allRounds = await InterviewRound.find(roundQuery)
      .sort({ roundOrder: 1, roundNumber: 1 })
      .lean();

    const roundIds = allRounds.map((r) => r._id);
    const questionQuery = { round: { $in: roundIds } };
    if (includeUnpublished !== 'true') {
      questionQuery.isPublished = true;
    }

    const allQuestions = await Question.find(questionQuery)
      .sort({ order: 1, createdAt: 1 })
      .lean();

    // Map questions by roundId
    const questionsByRound = new Map();
    for (const q of allQuestions) {
      const rId = String(q.round);
      if (!questionsByRound.has(rId)) {
        questionsByRound.set(rId, []);
      }
      questionsByRound.get(rId).push(q);
    }

    // Map rounds by experienceId
    const roundsByExp = new Map();
    for (const r of allRounds) {
      const eId = String(r.experience);
      if (!roundsByExp.has(eId)) {
        roundsByExp.set(eId, []);
      }
      roundsByExp.get(eId).push({
        ...r,
        questions: questionsByRound.get(String(r._id)) || [],
      });
    }

    const populatedExperiences = experiences.map((exp) => ({
      ...exp,
      rounds: roundsByExp.get(String(exp._id)) || [],
    }));

    const responsePayload = {
      success: true,
      data: {
        company,
        experiences: populatedExperiences,
      },
    };

    // Cache detail results for 60 seconds
    serverCache.set(cacheKey, responsePayload, 60 * 1000);

    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new company (Admin only)
// @route   POST /api/companies
// @access  Protected
const createCompany = async (req, res, next) => {
  try {
    const {
      name,
      aliases = [],
      website = '',
      logoUrl = '',
      about = '',
      generalAdvice = [],
      placementYears = [],
      isPublished = true,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required',
      });
    }

    const normalizedName = name.trim().toLowerCase();
    const existing = await Company.findOne({
      $or: [{ name: name.trim() }, { normalizedName }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Company with name '${name}' already exists`,
      });
    }

    const sanitizedAliases = Array.isArray(aliases)
      ? aliases.map((a) => String(a).trim()).filter(Boolean)
      : typeof aliases === 'string'
      ? aliases.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    const sanitizedYears = Array.isArray(placementYears)
      ? placementYears.map((y) => parseInt(y, 10)).filter((y) => !isNaN(y))
      : [];

    const company = await Company.create({
      name: name.trim(),
      normalizedName,
      aliases: sanitizedAliases,
      website: website.trim(),
      logoUrl: logoUrl.trim(),
      about: about.trim(),
      generalAdvice: Array.isArray(generalAdvice) ? generalAdvice.filter(Boolean) : [],
      placementYears: sanitizedYears,
      isPublished: isPublished ?? true,
    });

    invalidateCompanyCaches();

    res.status(201).json({
      success: true,
      data: company,
      message: 'Company created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company (Admin only)
// @route   PUT /api/companies/:id
// @access  Protected
const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      aliases,
      website,
      logoUrl,
      about,
      generalAdvice,
      placementYears,
      isPublished,
      needsReview,
      reviewNotes,
    } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    if (name && name.trim()) {
      const newNormalized = name.trim().toLowerCase();
      if (newNormalized !== company.normalizedName) {
        const existing = await Company.findOne({
          _id: { $ne: company._id },
          $or: [{ name: name.trim() }, { normalizedName: newNormalized }],
        });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: `Another company named '${name.trim()}' already exists`,
          });
        }
      }
      company.name = name.trim();
      company.normalizedName = newNormalized;
    }

    if (aliases !== undefined) {
      company.aliases = Array.isArray(aliases)
        ? aliases.map((a) => String(a).trim()).filter(Boolean)
        : typeof aliases === 'string'
        ? aliases.split(',').map((a) => a.trim()).filter(Boolean)
        : [];
    }

    if (website !== undefined) company.website = website.trim();
    if (logoUrl !== undefined) company.logoUrl = logoUrl.trim();
    if (about !== undefined) company.about = about.trim();
    if (generalAdvice !== undefined) {
      company.generalAdvice = Array.isArray(generalAdvice) ? generalAdvice.filter(Boolean) : [];
    }
    if (placementYears !== undefined) {
      company.placementYears = Array.isArray(placementYears)
        ? placementYears.map((y) => parseInt(y, 10)).filter((y) => !isNaN(y))
        : [];
    }
    if (isPublished !== undefined) company.isPublished = Boolean(isPublished);
    if (needsReview !== undefined) company.needsReview = Boolean(needsReview);
    if (reviewNotes !== undefined) company.reviewNotes = String(reviewNotes);

    await company.save();

    invalidateCompanyCaches();

    res.json({
      success: true,
      data: company,
      message: 'Company updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload company logo (Admin only)
// @route   POST /api/companies/upload-logo or POST /api/companies/:id/logo
// @access  Protected
const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please select a valid PNG, JPG, SVG, or WebP logo file.',
      });
    }

    const publicLogoUrl = `/uploads/logos/${req.file.filename}`;
    const { id } = req.params;

    let company = null;
    if (id) {
      company = await Company.findById(id);
      if (company) {
        company.logoUrl = publicLogoUrl;
        await company.save();
      }
    }

    invalidateCompanyCaches();

    res.json({
      success: true,
      logoUrl: publicLogoUrl,
      data: company,
      message: 'Logo uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company and related cascading experiences (Admin only)
// @route   DELETE /api/companies/:id
// @access  Protected
const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Cascade delete
    await Question.deleteMany({ company: company._id });
    await InterviewRound.deleteMany({ company: company._id });
    await InterviewExperience.deleteMany({ company: company._id });
    await company.deleteOne();

    invalidateCompanyCaches();

    res.json({
      success: true,
      message: `Company '${company.name}' and all associated experiences were deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public placement portal summary statistics from actual database records
// @route   GET /api/companies/stats/summary
// @access  Public
const getPublicStats = async (req, res, next) => {
  try {
    const cacheKey = 'stats:summary';
    const cachedStats = serverCache.get(cacheKey);
    if (cachedStats) {
      return res.json(cachedStats);
    }

    const [companiesCount, experiencesCount, roundsCount, questionsCount, codingQuestionsCount] = await Promise.all([
      Company.countDocuments({ isPublished: true }),
      InterviewExperience.countDocuments({ isPublished: true }),
      InterviewRound.countDocuments({ isPublished: true }),
      Question.countDocuments({ isPublished: true }),
      CodingQuestion.countDocuments({ isPublished: true }),
    ]);

    const payload = {
      success: true,
      data: {
        companiesCount,
        experiencesCount,
        roundsCount,
        questionsCount,
        codingQuestionsCount,
      },
    };

    serverCache.set(cacheKey, payload, 60 * 1000); // 1 minute TTL

    res.json(payload);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  getPublicStats,
  createCompany,
  updateCompany,
  uploadCompanyLogo,
  deleteCompany,
};


