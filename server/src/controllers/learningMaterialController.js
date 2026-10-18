const fs = require('fs');
const path = require('path');
const LearningMaterial = require('../models/LearningMaterial');
const Company = require('../models/Company');
const { uploadDir } = require('../middleware/upload');

// @desc    Get all learning materials with search, category & company filters
// @route   GET /api/learning-materials
// @access  Public
const getLearningMaterials = async (req, res, next) => {
  try {
    const {
      search = '',
      category = '',
      company = '',
      page = 1,
      limit = 20,
      includeUnpublished = 'false',
    } = req.query;

    const query = {};

    if (includeUnpublished !== 'true') {
      query.isPublished = true;
    }

    if (category.trim()) {
      query.category = category.trim();
    }

    if (company.trim()) {
      if (company.match(/^[0-9a-fA-F]{24}$/)) {
        query.company = company;
      } else {
        query.companyName = new RegExp(company.trim(), 'i');
      }
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { companyName: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await LearningMaterial.countDocuments(query);
    const materials = await LearningMaterial.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: {
        materials,
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

// @desc    Get single learning material
// @route   GET /api/learning-materials/:id
// @access  Public
const getLearningMaterialById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await LearningMaterial.findById(id).lean();

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Learning material not found',
      });
    }

    if (!material.isPublished && req.query.includeUnpublished !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'This learning material is currently unpublished',
      });
    }

    res.json({
      success: true,
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload or create a learning material (Admin only)
// @route   POST /api/learning-materials
// @access  Protected
const createLearningMaterial = async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      category,
      companyId = '',
      isExternalLink = 'false',
      externalUrl = '',
      fileType = '',
      isPublished = 'true',
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Resource title is required',
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required',
      });
    }

    let resolvedCompanyName = '';
    let resolvedCompanyId = null;

    if (companyId && companyId.match(/^[0-9a-fA-F]{24}$/)) {
      const comp = await Company.findById(companyId);
      if (comp) {
        resolvedCompanyId = comp._id;
        resolvedCompanyName = comp.name;
      }
    }

    const isExternal = isExternalLink === 'true' || isExternalLink === true;
    let finalFileUrl = '';
    let finalFileName = '';
    let finalFileType = fileType ? fileType.toUpperCase() : 'PDF';
    let finalFileSize = 0;

    if (isExternal) {
      if (!externalUrl || !externalUrl.trim()) {
        return res.status(400).json({
          success: false,
          message: 'External resource URL is required when link type is selected',
        });
      }
      finalFileUrl = externalUrl.trim();
      finalFileName = title.trim();
      finalFileType = fileType ? fileType.toUpperCase() : 'LINK';
    } else {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please select a document file to upload',
        });
      }
      finalFileUrl = `/uploads/learning-materials/${req.file.filename}`;
      finalFileName = req.file.originalname;
      finalFileSize = req.file.size;
      const ext = path.extname(req.file.originalname).replace('.', '').toUpperCase();
      finalFileType = ext || 'FILE';
    }

    const material = await LearningMaterial.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      company: resolvedCompanyId,
      companyName: resolvedCompanyName,
      fileType: finalFileType,
      fileName: finalFileName,
      fileSize: finalFileSize,
      fileUrl: finalFileUrl,
      isExternalLink: isExternal,
      isPublished: isPublished === 'true' || isPublished === true,
      uploadedBy: req.admin ? req.admin._id : null,
    });

    res.status(201).json({
      success: true,
      data: material,
      message: 'Learning resource uploaded successfully',
    });
  } catch (error) {
    // Clean up uploaded file if DB operation failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Update learning material metadata or publication status (Admin only)
// @route   PUT /api/learning-materials/:id
// @access  Protected
const updateLearningMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      companyId,
      isPublished,
      externalUrl,
    } = req.body;

    const material = await LearningMaterial.findById(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Learning material not found',
      });
    }

    if (title !== undefined) material.title = title.trim();
    if (description !== undefined) material.description = description.trim();
    if (category !== undefined) material.category = category.trim();

    if (companyId !== undefined) {
      if (companyId && companyId.match(/^[0-9a-fA-F]{24}$/)) {
        const comp = await Company.findById(companyId);
        if (comp) {
          material.company = comp._id;
          material.companyName = comp.name;
        }
      } else {
        material.company = null;
        material.companyName = '';
      }
    }

    if (isPublished !== undefined) {
      material.isPublished = isPublished === 'true' || isPublished === true;
    }

    if (material.isExternalLink && externalUrl) {
      material.fileUrl = externalUrl.trim();
    }

    // If replacement file uploaded
    if (req.file) {
      // Remove old file if local
      if (!material.isExternalLink && material.fileUrl.startsWith('/uploads/learning-materials/')) {
        const oldFile = path.join(uploadDir, path.basename(material.fileUrl));
        if (fs.existsSync(oldFile)) {
          fs.unlinkSync(oldFile);
        }
      }

      material.fileUrl = `/uploads/learning-materials/${req.file.filename}`;
      material.fileName = req.file.originalname;
      material.fileSize = req.file.size;
      const ext = path.extname(req.file.originalname).replace('.', '').toUpperCase();
      material.fileType = ext || 'FILE';
      material.isExternalLink = false;
    }

    await material.save();

    res.json({
      success: true,
      data: material,
      message: 'Learning material updated successfully',
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Delete learning material (Admin only)
// @route   DELETE /api/learning-materials/:id
// @access  Protected
const deleteLearningMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await LearningMaterial.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Learning material not found',
      });
    }

    // Remove local file if exists
    if (!material.isExternalLink && material.fileUrl.startsWith('/uploads/learning-materials/')) {
      const filePath = path.join(uploadDir, path.basename(material.fileUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await LearningMaterial.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Learning material deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download or access learning material
// @route   GET /api/learning-materials/:id/download
// @access  Public
const downloadLearningMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await LearningMaterial.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    if (!material.isPublished && req.query.includeUnpublished !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'This resource is unpublished',
      });
    }

    // Increment download counter
    material.downloadCount += 1;
    await material.save();

    if (material.isExternalLink) {
      return res.redirect(material.fileUrl);
    }

    const localFileName = path.basename(material.fileUrl);
    const fullPath = path.join(uploadDir, localFileName);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on storage server',
      });
    }

    res.download(fullPath, material.fileName || localFileName);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLearningMaterials,
  getLearningMaterialById,
  createLearningMaterial,
  updateLearningMaterial,
  deleteLearningMaterial,
  downloadLearningMaterial,
};
