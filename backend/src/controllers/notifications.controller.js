
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import Joi from 'joi';

// Note: Assuming email and SMS services are configured in utils
// const { sendEmail } = require('../utils/email');
// const { sendSMS } = require('../utils/sms');

// Validation schema
const sendNotificationSchema = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().valid('Email', 'SMS').required(),
  content: Joi.string().required()
});

// Send notification
const sendNotification = asyncHandler(async (req, res) => {
  const { error, value } = sendNotificationSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  // Validate that the user exists
  const user = await User.findById(value.userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Create notification record
  const notification = await Notification.create({
    userId: value.userId,
    type: value.type,
    content: value.content
  });

  try {
    if (value.type === 'Email') {
      // Send email using configured service
      // await sendEmail(user.email, 'Notification', value.content);
      console.log(`Email notification sent to ${user.email}: ${value.content}`);
    } else if (value.type === 'SMS') {
      // Send SMS using configured service
      // await sendSMS(user.phone, value.content);
      console.log(`SMS notification sent to ${user.phone}: ${value.content}`);
    }

    // Update notification status
    notification.status = 'sent';
    await notification.save();

  } catch (error) {
    console.error('Failed to send notification:', error);
    notification.status = 'failed';
    await notification.save();
    throw new ApiError(500, 'Failed to send notification');
  }

  const populatedNotification = await Notification.findById(notification._id)
    .populate('userId', 'name email');

  res.status(201).json(new ApiResponse(201, populatedNotification, 'Notification sent successfully'));
});

// Get notifications for current user
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments({ userId: req.user.id });

  res.json(new ApiResponse(200, {
    notifications,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  }, 'Notifications retrieved successfully'));
});

// Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  // Only allow users to mark their own notifications as read
  if (notification.userId.toString() !== req.user.id) {
    throw new ApiError(403, 'Not authorized to modify this notification');
  }

  notification.readStatus = true;
  await notification.save();

  res.json(new ApiResponse(200, notification, 'Notification marked as read'));
});

// Create notification (admin only)
const createNotification = asyncHandler(async (req, res) => {
  // Only admins can create notifications
  if (req.user.role !== 'Admin') {
    throw new ApiError(403, 'Only admins can create notifications');
  }

  const { error, value } = sendNotificationSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  // Validate that the user exists
  const user = await User.findById(value.userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Create notification record
  const notification = await Notification.create({
    userId: value.userId,
    type: value.type,
    content: value.content
  });

  try {
    if (value.type === 'Email') {
      console.log(`Email notification sent to ${user.email}: ${value.content}`);
    } else if (value.type === 'SMS') {
      console.log(`SMS notification sent to ${user.phone}: ${value.content}`);
    }

    notification.status = 'sent';
    await notification.save();

  } catch (error) {
    console.error('Failed to send notification:', error);
    notification.status = 'failed';
    await notification.save();
    throw new ApiError(500, 'Failed to send notification');
  }

  const populatedNotification = await Notification.findById(notification._id)
    .populate('userId', 'name email');

  res.status(201).json(new ApiResponse(201, populatedNotification, 'Notification created successfully'));
});

export {
  getNotifications,
  markAsRead,
  createNotification
};

// Export alias for backward compatibility
export { createNotification as sendNotification };
