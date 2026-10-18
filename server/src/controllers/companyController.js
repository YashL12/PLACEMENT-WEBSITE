const Company = require('../models/Company');
const InterviewExperience = require('../models/InterviewExperience');
const InterviewRound = require('../models/InterviewRound');
const Question = require('../models/Question');

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

    // Sorting
    let sortOptions = {};
    if (sort === 'name') {
      sortOptions = { name: 1 };
    } else if (sort === 'name_desc') {
      sortOptions = { name: -1 };
    } else if (sort === 'experiences') {
      sortOptions = { totalExperiencesCount: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else {
      sortOptions = { name: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
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
    });
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

    // Fetch rounds and questions for each experience
    const populatedExperiences = await Promise.all(
      experiences.map(async (exp) => {
        const roundQuery = { experience: exp._id };
        if (includeUnpublished !== 'true') {
          roundQuery.isPublished = true;
        }

        const rounds = await InterviewRound.find(roundQuery)
          .sort({ roundOrder: 1, roundNumber: 1 })
          .lean();

        const populatedRounds = await Promise.all(
          rounds.map(async (round) => {
            const questionQuery = { round: round._id };
            if (includeUnpublished !== 'true') {
              questionQuery.isPublished = true;
            }

            const questions = await Question.find(questionQuery)
              .sort({ order: 1, createdAt: 1 })
              .lean();

            return {
              ...round,
              questions,
            };
          })
        );

        return {
          ...exp,
          rounds: populatedRounds,
        };
      })
    );

    res.json({
      success: true,
      data: {
        company,
        experiences: populatedExperiences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new company (Admin only)
// @route   POST /api/companies
// @access  Protected
const createCompany = async (req, res, next) => {
  try {
    const { name, aliases = [], website = '', logoUrl = '', about = '', generalAdvice = [], isPublished = true } = req.body;

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

    const company = await Company.create({
      name: name.trim(),
      normalizedName,
      aliases: aliases.map((a) => a.trim()).filter(Boolean),
      website: website.trim(),
      logoUrl: logoUrl.trim(),
      about: about.trim(),
      generalAdvice,
      isPublished,
    });

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
    const { name, aliases, website, logoUrl, about, generalAdvice, isPublished, needsReview, reviewNotes } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    if (name) {
      company.name = name.trim();
      company.normalizedName = name.trim().toLowerCase();
    }
    if (aliases !== undefined) company.aliases = aliases;
    if (website !== undefined) company.website = website.trim();
    if (logoUrl !== undefined) company.logoUrl = logoUrl.trim();
    if (about !== undefined) company.about = about.trim();
    if (generalAdvice !== undefined) company.generalAdvice = generalAdvice;
    if (isPublished !== undefined) company.isPublished = isPublished;
    if (needsReview !== undefined) company.needsReview = needsReview;
    if (reviewNotes !== undefined) company.reviewNotes = reviewNotes;

    await company.save();

    res.json({
      success: true,
      data: company,
      message: 'Company updated successfully',
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

    res.json({
      success: true,
      message: `Company '${company.name}' and all associated experiences were deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};
