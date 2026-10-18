const InterviewExperience = require('../models/InterviewExperience');
const InterviewRound = require('../models/InterviewRound');
const Question = require('../models/Question');
const Company = require('../models/Company');

// @desc    Get experiences (filterable by company or placement year)
// @route   GET /api/experiences
// @access  Public
const getExperiences = async (req, res, next) => {
  try {
    const { companyId, year, includeUnpublished = 'false' } = req.query;

    const query = {};
    if (companyId) query.company = companyId;
    if (year) query.placementYear = parseInt(year, 10);
    if (includeUnpublished !== 'true') query.isPublished = true;

    const experiences = await InterviewExperience.find(query)
      .populate('company', 'name normalizedName aliases')
      .sort({ placementYear: -1, order: 1 })
      .lean();

    res.json({
      success: true,
      data: experiences,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single experience with rounds and questions
// @route   GET /api/experiences/:id
// @access  Public
const getExperienceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { includeUnpublished = 'false' } = req.query;

    const exp = await InterviewExperience.findById(id)
      .populate('company', 'name normalizedName aliases generalAdvice')
      .lean();

    if (!exp) {
      return res.status(404).json({
        success: false,
        message: 'Interview experience not found',
      });
    }

    if (!exp.isPublished && includeUnpublished !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'This interview experience is currently unpublished or pending review',
      });
    }

    const roundQuery = { experience: exp._id };
    if (includeUnpublished !== 'true') roundQuery.isPublished = true;

    const rounds = await InterviewRound.find(roundQuery)
      .sort({ roundOrder: 1, roundNumber: 1 })
      .lean();

    const populatedRounds = await Promise.all(
      rounds.map(async (round) => {
        const questionQuery = { round: round._id };
        if (includeUnpublished !== 'true') questionQuery.isPublished = true;

        const questions = await Question.find(questionQuery)
          .sort({ order: 1 })
          .lean();

        return { ...round, questions };
      })
    );

    res.json({
      success: true,
      data: {
        ...exp,
        rounds: populatedRounds,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new experience (Admin only)
// @route   POST /api/experiences
// @access  Protected
const createExperience = async (req, res, next) => {
  try {
    const {
      companyId,
      role = 'Software Engineer',
      placementYear = null,
      sourceDocument = 'Manual Entry',
      sourcePage = '',
      processOverview = '',
      totalRoundsCount = 0,
      advice = [],
      alumniContributions = [],
      isPublished = true,
      needsReview = false,
      reviewNotes = '',
    } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found with given companyId',
      });
    }

    const exp = await InterviewExperience.create({
      company: company._id,
      role,
      placementYear: placementYear ? parseInt(placementYear, 10) : null,
      sourceDocument,
      sourcePage,
      processOverview,
      totalRoundsCount,
      advice,
      alumniContributions,
      isPublished,
      needsReview,
      reviewNotes,
    });

    // Update company aggregate
    company.totalExperiencesCount = await InterviewExperience.countDocuments({ company: company._id });
    if (exp.placementYear && !company.placementYears.includes(exp.placementYear)) {
      company.placementYears.push(exp.placementYear);
      company.placementYears.sort();
    }
    await company.save();

    res.status(201).json({
      success: true,
      data: exp,
      message: 'Interview experience created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update experience (Admin only)
// @route   PUT /api/experiences/:id
// @access  Protected
const updateExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      role,
      placementYear,
      processOverview,
      totalRoundsCount,
      advice,
      alumniContributions,
      isPublished,
      needsReview,
      reviewNotes,
    } = req.body;

    const exp = await InterviewExperience.findById(id);
    if (!exp) {
      return res.status(404).json({
        success: false,
        message: 'Interview experience not found',
      });
    }

    if (role !== undefined) exp.role = role;
    if (placementYear !== undefined) exp.placementYear = placementYear ? parseInt(placementYear, 10) : null;
    if (processOverview !== undefined) exp.processOverview = processOverview;
    if (totalRoundsCount !== undefined) exp.totalRoundsCount = totalRoundsCount;
    if (advice !== undefined) exp.advice = advice;
    if (alumniContributions !== undefined) exp.alumniContributions = alumniContributions;
    if (isPublished !== undefined) exp.isPublished = isPublished;
    if (needsReview !== undefined) exp.needsReview = needsReview;
    if (reviewNotes !== undefined) exp.reviewNotes = reviewNotes;

    await exp.save();

    // Recompute company years
    const company = await Company.findById(exp.company);
    if (company) {
      const exps = await InterviewExperience.find({ company: company._id });
      company.placementYears = [
        ...new Set(exps.map((e) => e.placementYear).filter((y) => y !== null && y !== undefined)),
      ].sort();
      await company.save();
    }

    res.json({
      success: true,
      data: exp,
      message: 'Interview experience updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete experience and cascading rounds/questions (Admin only)
// @route   DELETE /api/experiences/:id
// @access  Protected
const deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exp = await InterviewExperience.findById(id);
    if (!exp) {
      return res.status(404).json({
        success: false,
        message: 'Interview experience not found',
      });
    }

    const companyId = exp.company;
    await Question.deleteMany({ experience: exp._id });
    await InterviewRound.deleteMany({ experience: exp._id });
    await exp.deleteOne();

    // Update company metrics
    const company = await Company.findById(companyId);
    if (company) {
      const exps = await InterviewExperience.find({ company: company._id });
      company.totalExperiencesCount = exps.length;
      company.placementYears = [
        ...new Set(exps.map((e) => e.placementYear).filter((y) => y !== null && y !== undefined)),
      ].sort();
      await company.save();
    }

    res.json({
      success: true,
      message: 'Interview experience and its rounds/questions deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
};
