import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Event from "../models/event.model.js";
import Lead from "../models/lead.model.js";
import Joi from "joi";

// Validation schemas
const createEventSchema = Joi.object({
  leadId: Joi.string().required(),
  title: Joi.string().required().trim(),
  startTime: Joi.date().required(),
  endTime: Joi.date().required(),
  timezone: Joi.string().default("UTC"),
  description: Joi.string().optional(),
});

// Create event
const createEvent = asyncHandler(async (req, res) => {
  const { error, value } = createEventSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  // Validate that the lead exists
  const lead = await Lead.findById(value.leadId);
  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // Convert times to UTC for storage
  const startTimeUTC = new Date(value.startTime);
  const endTimeUTC = new Date(value.endTime);

  // Check for time conflicts
  const conflictingEvent = await Event.findOne({
    userId: req.user.id,
    $or: [
      {
        startTime: { $lt: endTimeUTC },
        endTime: { $gt: startTimeUTC },
      },
    ],
  });

  if (conflictingEvent) {
    throw new ApiError(409, "Time conflict with existing event");
  }

  const event = await Event.create({
    ...value,
    userId: req.user.id,
    startTime: startTimeUTC,
    endTime: endTimeUTC,
  });

  const populatedEvent = await Event.findById(event._id)
    .populate("leadId", "clientName status")
    .populate("userId", "name email");

  res.status(201).json(new ApiResponse(201, populatedEvent, "Event created successfully"));
});

// Get events
const getEvents = asyncHandler(async (req, res) => {
  const { startDate, endDate, leadId } = req.query;

  // Build filter
  const filter = { userId: req.user.id };

  if (leadId) {
    filter.leadId = leadId;
  }

  if (startDate || endDate) {
    filter.startTime = {};
    if (startDate) filter.startTime.$gte = new Date(startDate);
    if (endDate) filter.startTime.$lte = new Date(endDate);
  }

  const events = await Event.find(filter)
    .populate("leadId", "clientName status")
    .populate("userId", "name email")
    .sort({ startTime: 1 });

  res.json(new ApiResponse(200, events, "Events retrieved successfully"));
});

// Delete event
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Only the creator or admin can delete
  if (event.userId.toString() !== req.user.id && req.user.role !== "Admin") {
    throw new ApiError(403, "Access denied");
  }

  await Event.findByIdAndDelete(req.params.id);

  res.json(new ApiResponse(200, null, "Event deleted successfully"));
});

export { createEvent, getEvents, deleteEvent };
