const Alumni = require('../models/Alumni');
const Company = require('../models/Company');

// Helper to validate LinkedIn URL format
function isValidLinkedInUrl(url) {
  if (!url) return false;
  return /^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(url.trim());
}

// @desc    Get alumni list with search and featured ranking (Kevit first)
// @route   GET /api/alumni
// @access  Public
const getAlumni = async (req, res, next) => {
  try {
    const {
      search = '',
      company = '',
      page = 1,
      limit = 30,
      includeUnpublished = 'false',
    } = req.query;

    const query = {};

    if (includeUnpublished !== 'true') {
      query.isPublished = true;
    }

    if (company.trim()) {
      query.companyName = new RegExp(company.trim(), 'i');
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { companyName: searchRegex },
        { jobTitle: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Alumni.countDocuments(query);

    // Sorting: Featured alumni first (isFeatured: -1), then by featuredOrder (ascending), then by name (ascending)
    const alumniList = await Alumni.find(query)
      .sort({ isFeatured: -1, featuredOrder: 1, name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: {
        alumni: alumniList,
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

// @desc    Get single alumni profile
// @route   GET /api/alumni/:id
// @access  Public
const getAlumniById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alumni = await Alumni.findById(id).lean();

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni record not found',
      });
    }

    if (!alumni.isPublished && req.query.includeUnpublished !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'This alumni profile is currently unpublished',
      });
    }

    res.json({
      success: true,
      data: alumni,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new alumni record (Admin only)
// @route   POST /api/alumni
// @access  Protected
const createAlumni = async (req, res, next) => {
  try {
    const {
      name,
      companyName,
      linkedinUrl,
      jobTitle = '',
      companyLogo = '',
      profilePhoto = '',
      isFeatured = false,
      featuredOrder = 0,
      isPublished = true,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required',
      });
    }

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required',
      });
    }

    if (!linkedinUrl || !isValidLinkedInUrl(linkedinUrl)) {
      return res.status(400).json({
        success: false,
        message: 'A valid LinkedIn URL (e.g., https://linkedin.com/in/username) is required',
      });
    }

    // Auto-resolve company logo from Company collection if not provided
    let resolvedCompanyLogo = companyLogo ? companyLogo.trim() : '';
    if (!resolvedCompanyLogo) {
      const matchComp = await Company.findOne({
        $or: [
          { name: new RegExp(`^${companyName.trim()}$`, 'i') },
          { normalizedName: companyName.trim().toLowerCase() },
          { aliases: new RegExp(`^${companyName.trim()}$`, 'i') },
        ],
      });
      if (matchComp && matchComp.logoUrl) {
        resolvedCompanyLogo = matchComp.logoUrl;
      }
    }

    const alumni = await Alumni.create({
      name: name.trim(),
      companyName: companyName.trim(),
      linkedinUrl: linkedinUrl.trim(),
      jobTitle: jobTitle.trim(),
      companyLogo: resolvedCompanyLogo,
      profilePhoto: profilePhoto.trim(),
      isFeatured: Boolean(isFeatured),
      featuredOrder: Number(featuredOrder) || 0,
      isPublished: isPublished === undefined ? true : Boolean(isPublished),
      createdBy: req.admin ? req.admin._id : null,
    });

    res.status(201).json({
      success: true,
      data: alumni,
      message: 'Alumni record created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update alumni record (Admin only)
// @route   PUT /api/alumni/:id
// @access  Protected
const updateAlumni = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      companyName,
      linkedinUrl,
      jobTitle,
      companyLogo,
      profilePhoto,
      isFeatured,
      featuredOrder,
      isPublished,
    } = req.body;

    const alumni = await Alumni.findById(id);
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni record not found',
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty' });
      }
      alumni.name = name.trim();
    }

    if (companyName !== undefined) {
      if (!companyName.trim()) {
        return res.status(400).json({ success: false, message: 'Company name cannot be empty' });
      }
      alumni.companyName = companyName.trim();
    }

    if (linkedinUrl !== undefined) {
      if (!isValidLinkedInUrl(linkedinUrl)) {
        return res.status(400).json({
          success: false,
          message: 'A valid LinkedIn URL (https://linkedin.com/in/...) is required',
        });
      }
      alumni.linkedinUrl = linkedinUrl.trim();
    }

    if (jobTitle !== undefined) alumni.jobTitle = jobTitle.trim();
    if (companyLogo !== undefined) alumni.companyLogo = companyLogo.trim();
    if (profilePhoto !== undefined) alumni.profilePhoto = profilePhoto.trim();
    if (isFeatured !== undefined) alumni.isFeatured = Boolean(isFeatured);
    if (featuredOrder !== undefined) alumni.featuredOrder = Number(featuredOrder) || 0;
    if (isPublished !== undefined) alumni.isPublished = Boolean(isPublished);

    await alumni.save();

    res.json({
      success: true,
      data: alumni,
      message: 'Alumni record updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete alumni record (Admin only)
// @route   DELETE /api/alumni/:id
// @access  Protected
const deleteAlumni = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alumni = await Alumni.findByIdAndDelete(id);

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni record not found',
      });
    }

    res.json({
      success: true,
      message: 'Alumni record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle featured status of alumni (Admin only)
// @route   PATCH /api/alumni/:id/featured
// @access  Protected
const toggleFeaturedAlumni = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alumni = await Alumni.findById(id);

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni record not found',
      });
    }

    alumni.isFeatured = !alumni.isFeatured;
    if (alumni.isFeatured && alumni.featuredOrder === 0) {
      alumni.featuredOrder = 1;
    }
    await alumni.save();

    res.json({
      success: true,
      data: alumni,
      message: `Alumni '${alumni.name}' ${alumni.isFeatured ? 'marked as featured' : 'unfeatured'}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlumni,
  getAlumniById,
  createAlumni,
  updateAlumni,
  deleteAlumni,
  toggleFeaturedAlumni,
};
