const Question = require('../models/Question');
const InterviewRound = require('../models/InterviewRound');

// @desc    Get questions for a round
// @route   GET /api/questions
// @access  Public
const getQuestions = async (req, res, next) => {
  try {
    const { roundId, includeUnpublished = 'false' } = req.query;
    const query = {};
    if (roundId) query.round = roundId;
    if (includeUnpublished !== 'true') query.isPublished = true;

    const questions = await Question.find(query).sort({ order: 1 }).lean();
    res.json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
};

// @desc    Create question (Admin only)
// @route   POST /api/questions
// @access  Protected
const createQuestion = async (req, res, next) => {
  try {
    const { roundId, questionText, context = '', topic = '', order = 1, solutionUrl = '', isPublished = true } = req.body;

    const round = await InterviewRound.findById(roundId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Round not found' });
    }

    const question = await Question.create({
      round: round._id,
      experience: round.experience,
      company: round.company,
      questionText,
      context,
      topic,
      order,
      solutionUrl,
      isPublished,
    });

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question (Admin only)
// @route   PUT /api/questions/:id
// @access  Protected
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question (Admin only)
// @route   DELETE /api/questions/:id
// @access  Protected
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    await question.deleteOne();
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getQuestions, createQuestion, updateQuestion, deleteQuestion };
