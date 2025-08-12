
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Message from '../models/message.model.js';
import Lead from '../models/lead.model.js';
import { getPagination } from '../utils/pagination.js';
import Joi from 'joi';

// Validation schema
const createMessageSchema = Joi.object({
  content: Joi.string().required().trim()
});

// Send message
const sendMessage = asyncHandler(async (req, res) => {
  const { error, value } = createMessageSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  // Validate that the lead exists
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  const message = await Message.create({
    leadId: req.params.id,
    senderId: req.user.id,
    content: value.content
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('senderId', 'name email role');

  // Emit Socket.IO event to the lead chat room
  if (req.io) {
    req.io.to(`lead:${req.params.id}`).emit('newMessage', populatedMessage);
  }

  res.status(201).json(new ApiResponse(201, populatedMessage, 'Message sent successfully'));
});

// Get messages for a lead
const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { skip, limit: pageLimit } = getPagination(page, limit);

  // Validate that the lead exists
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  const total = await Message.countDocuments({ leadId: req.params.id });
  const messages = await Message.find({ leadId: req.params.id })
    .populate('senderId', 'name email role')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(pageLimit);

  res.json(new ApiResponse(200, {
    messages: messages.reverse(), // Reverse to show oldest first
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / pageLimit),
      limit: pageLimit
    }
  }, 'Messages retrieved successfully'));
});

// Mark messages as read
const markAsRead = asyncHandler(async (req, res) => {
  await Message.updateMany(
    { 
      leadId: req.params.id,
      senderId: { $ne: req.user.id },
      readStatus: false
    },
    { readStatus: true }
  );

  res.json(new ApiResponse(200, null, 'Messages marked as read'));
});

export {
  sendMessage,
  getMessages,
  markAsRead
};
