const InterviewRound = require('../models/InterviewRound');
const Question = require('../models/Question');
const InterviewExperience = require('../models/InterviewExperience');

// @desc    Get rounds for an experience
// @route   GET /api/rounds
// @access  Public
const getRounds = async (req, res, next) => {
  try {
    const { experienceId, includeUnpublished = 'false' } = req.query;
    const query = {};
    if (experienceId) query.experience = experienceId;
    if (includeUnpublished !== 'true') query.isPublished = true;

    const rounds = await InterviewRound.find(query)
      .sort({ roundOrder: 1 })
      .lean();

    res.json({ success: true, data: rounds });
  } catch (error) {
    next(error);
  }
};

// @desc    Create round (Admin only)
// @route   POST /api/rounds
// @access  Protected
const createRound = async (req, res, next) => {
  try {
    const { experienceId, roundNumber, roundOrder, roundName, roundType, description, instructions, isPublished = true } = req.body;

    const exp = await InterviewExperience.findById(experienceId);
    if (!exp) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    const round = await InterviewRound.create({
      experience: exp._id,
      company: exp.company,
      roundNumber: roundNumber || 1,
      roundOrder: roundOrder || roundNumber || 1,
      roundName,
      roundType: roundType || 'Other',
      description,
      instructions,
      isPublished,
    });

    res.status(201).json({ success: true, data: round });
  } catch (error) {
    next(error);
  }
};

// @desc    Update round (Admin only)
// @route   PUT /api/rounds/:id
// @access  Protected
const updateRound = async (req, res, next) => {
  try {
    const { id } = req.params;
    const round = await InterviewRound.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!round) {
      return res.status(404).json({ success: false, message: 'Round not found' });
    }
    res.json({ success: true, data: round });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete round and cascading questions (Admin only)
// @route   DELETE /api/rounds/:id
// @access  Protected
const deleteRound = async (req, res, next) => {
  try {
    const { id } = req.params;
    const round = await InterviewRound.findById(id);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Round not found' });
    }
    await Question.deleteMany({ round: round._id });
    await round.deleteOne();
    res.json({ success: true, message: 'Round and its questions deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRounds, createRound, updateRound, deleteRound };
