const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Company = require('../models/Company');
const InterviewExperience = require('../models/InterviewExperience');
const InterviewRound = require('../models/InterviewRound');
const Question = require('../models/Question');
const ImportReport = require('../models/ImportReport');
const LearningMaterial = require('../models/LearningMaterial');
const Alumni = require('../models/Alumni');
const { runImport } = require('../../scripts/import-placement-data');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'placement_portal_jwt_secret_secure_key_2026',
    { expiresIn: '7d' }
  );
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(admin._id);

    res.json({
      success: true,
      data: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/me
// @access  Protected
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.admin,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Protected
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCompanies,
      publishedCompanies,
      totalExperiences,
      publishedExperiences,
      totalRounds,
      totalQuestions,
      flaggedCompanies,
      flaggedExperiences,
      totalMaterials,
      publishedMaterials,
      totalAlumni,
      publishedAlumni,
      latestReport,
    ] = await Promise.all([
      Company.countDocuments(),
      Company.countDocuments({ isPublished: true }),
      InterviewExperience.countDocuments(),
      InterviewExperience.countDocuments({ isPublished: true }),
      InterviewRound.countDocuments(),
      Question.countDocuments(),
      Company.countDocuments({ needsReview: true }),
      InterviewExperience.countDocuments({ needsReview: true }),
      LearningMaterial.countDocuments(),
      LearningMaterial.countDocuments({ isPublished: true }),
      Alumni.countDocuments(),
      Alumni.countDocuments({ isPublished: true }),
      ImportReport.findOne().sort({ importDate: -1 }),
    ]);

    // Breakdown by placement years
    const experiencesByYear = await InterviewExperience.aggregate([
      {
        $group: {
          _id: '$placementYear',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    // Breakdown by round types
    const roundsByType = await InterviewRound.aggregate([
      {
        $group: {
          _id: '$roundType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          companies: totalCompanies,
          publishedCompanies,
          unpublishedCompanies: totalCompanies - publishedCompanies,
          experiences: totalExperiences,
          publishedExperiences,
          unpublishedExperiences: totalExperiences - publishedExperiences,
          rounds: totalRounds,
          questions: totalQuestions,
          learningMaterials: totalMaterials,
          publishedMaterials,
          alumni: totalAlumni,
          publishedAlumni,
          reviewQueue: flaggedCompanies + flaggedExperiences,
        },
        experiencesByYear: experiencesByYear.map((item) => ({
          year: item._id === null ? 'Unknown / Undated' : String(item._id),
          count: item.count,
        })),
        roundsByType: roundsByType.map((item) => ({
          type: item._id,
          count: item.count,
        })),
        latestReport,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get records requiring manual review
// @route   GET /api/admin/review-queue
// @access  Protected
const getReviewQueue = async (req, res, next) => {
  try {
    const flaggedCompanies = await Company.find({ needsReview: true }).lean();
    const flaggedExperiences = await InterviewExperience.find({ needsReview: true })
      .populate('company', 'name')
      .lean();

    res.json({
      success: true,
      data: {
        companies: flaggedCompanies,
        experiences: flaggedExperiences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve review for company or experience
// @route   POST /api/admin/resolve-review
// @access  Protected
const resolveReview = async (req, res, next) => {
  try {
    const { type, id, action, newName, targetCompanyId, publishNow = true, notes = '' } = req.body;

    if (type === 'company') {
      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
      }

      if (action === 'merge' && targetCompanyId) {
        // Merge this company into target company
        const target = await Company.findById(targetCompanyId);
        if (!target) {
          return res.status(404).json({ success: false, message: 'Target company not found' });
        }

        // Re-assign experiences, rounds, and questions
        await InterviewExperience.updateMany({ company: company._id }, { company: target._id });
        await InterviewRound.updateMany({ company: company._id }, { company: target._id });
        await Question.updateMany({ company: company._id }, { company: target._id });

        // Add alias to target
        if (!target.aliases.includes(company.name)) {
          target.aliases.push(company.name);
        }
        target.aliases = [...new Set([...target.aliases, ...company.aliases])];
        target.totalExperiencesCount = await InterviewExperience.countDocuments({ company: target._id });
        await target.save();

        await company.deleteOne();

        return res.json({
          success: true,
          message: `Company '${company.name}' successfully merged into '${target.name}' with aliases retained`,
        });
      } else {
        // Approve / Rename
        if (newName) {
          company.name = newName.trim();
          company.normalizedName = newName.trim().toLowerCase();
        }
        company.needsReview = false;
        company.reviewNotes = notes || 'Reviewed and approved by administrator';
        if (publishNow) company.isPublished = true;
        await company.save();

        return res.json({
          success: true,
          data: company,
          message: 'Company marked as reviewed and resolved',
        });
      }
    } else if (type === 'experience') {
      const exp = await InterviewExperience.findById(id);
      if (!exp) {
        return res.status(404).json({ success: false, message: 'Experience not found' });
      }

      if (targetCompanyId) {
        const target = await Company.findById(targetCompanyId);
        if (!target) {
          return res.status(404).json({ success: false, message: 'Target company not found' });
        }
        exp.company = target._id;
        await InterviewRound.updateMany({ experience: exp._id }, { company: target._id });
        await Question.updateMany({ experience: exp._id }, { company: target._id });
      }

      exp.needsReview = false;
      exp.reviewNotes = notes || 'Reviewed and approved by administrator';
      if (publishNow) exp.isPublished = true;
      await exp.save();

      return res.json({
        success: true,
        data: exp,
        message: 'Experience review resolved successfully',
      });
    }

    res.status(400).json({ success: false, message: "Invalid type. Must be 'company' or 'experience'" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get import reports history
// @route   GET /api/admin/import-reports
// @access  Protected
const getImportReports = async (req, res, next) => {
  try {
    const reports = await ImportReport.find().sort({ importDate: -1 }).limit(10).lean();
    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  getDashboardStats,
  getReviewQueue,
  resolveReview,
  getImportReports,
};
