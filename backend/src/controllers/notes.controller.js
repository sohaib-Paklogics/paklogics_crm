
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import LeadNote from '../models/leadNote.model.js';
import Lead from '../models/lead.model.js';
import Joi from 'joi';

// Validation schema
const createNoteSchema = Joi.object({
  text: Joi.string().required()
});

// Create note
const createNote = asyncHandler(async (req, res) => {
  // Only Admin and BD can create notes
  if (!['Admin', 'BD'].includes(req.user.role)) {
    throw new ApiError(403, 'Only Admin and BD can create notes');
  }

  const { error, value } = createNoteSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  // Validate that the lead exists
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  const note = await LeadNote.create({
    leadId: req.params.id,
    userId: req.user.id,
    text: value.text
  });

  const populatedNote = await LeadNote.findById(note._id)
    .populate('userId', 'name email role');

  res.status(201).json(new ApiResponse(201, populatedNote, 'Note created successfully'));
});

// Get notes for a lead
const getNotes = asyncHandler(async (req, res) => {
  // Only Admin and BD can view notes
  if (!['Admin', 'BD'].includes(req.user.role)) {
    throw new ApiError(403, 'Only Admin and BD can view notes');
  }

  // Validate that the lead exists
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  const notes = await LeadNote.find({ leadId: req.params.id })
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, notes, 'Notes retrieved successfully'));
});

export {
  createNote,
  getNotes
};
