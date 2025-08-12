import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Lead from "../models/lead.model.js";
import Attachment from "../models/attachment.model.js";
import AuditLog from "../models/auditLog.model.js";
import { getPagination } from "../utils/pagination.js";
import Joi from "joi";
import multer from "multer";
import path from "path";

// Validation schemas
const createLeadSchema = Joi.object({
  clientName: Joi.string().trim().required(),
  jobDescription: Joi.string().required(),
  source: Joi.string().valid("website", "referral", "linkedin", "job_board", "other").required(),
  assignedTo: Joi.string().hex().length(24).optional(), // ObjectId check
  status: Joi.string().valid("new", "interview_scheduled", "test_assigned", "completed").optional(), // default handled by Mongoose
  notes: Joi.string().optional(),
});

const updateLeadSchema = Joi.object({
  clientName: Joi.string().trim().optional(),
  jobDescription: Joi.string().optional(),
  source: Joi.string().valid("website", "referral", "linkedin", "job_board", "other").optional(),
  assignedTo: Joi.string().hex().length(24).optional(),
  status: Joi.string().valid("new", "interview_scheduled", "test_assigned", "completed").optional(),
  notes: Joi.string().optional(),
});

const statusUpdateSchema = Joi.object({
  status: Joi.string().valid("New", "Interview Scheduled", "Test Assigned", "Completed").required(),
});

const assignDeveloperSchema = Joi.object({
  developerId: Joi.string().required(),
});

// Valid status transitions
const validTransitions = {
  "New": ["Interview Scheduled", "Test Assigned"],
  "Interview Scheduled": ["Test Assigned", "Completed"],
  "Test Assigned": ["Completed", "Interview Scheduled"],
  "Completed": [], // Cannot transition from completed
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/attachments/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only PDF and DOCX files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Create audit log entry
const createAuditLog = async (userId, action, entity, entityId, oldValues = null, newValues = null) => {
  try {
    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      oldValues,
      newValues,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};

// Create lead
const createLead = asyncHandler(async (req, res) => {
  const { error, value } = createLeadSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const lead = await Lead.create({
    ...value,
    createdBy: req.user.id,
  });

  await createAuditLog(req.user.id, "CREATE", "Lead", lead._id, null, lead);

  const populatedLead = await Lead.findById(lead._id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  res.status(201).json(new ApiResponse(201, populatedLead, "Lead created successfully"));
});

// Get all leads with filtering
const getLeads = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, source, assignedTo } = req.query;
  const { skip, limit: pageLimit } = getPagination(page, limit);

  // Build filter object
  const filter = {};
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (assignedTo) filter.assignedTo = assignedTo;

  // Role-based filtering
  if (req.user.role === "Developer") {
    filter.assignedTo = req.user.id;
  }

  const total = await Lead.countDocuments(filter);
  const leads = await Lead.find(filter)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  res.json(
    new ApiResponse(
      200,
      {
        leads,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / pageLimit),
          limit: pageLimit,
        },
      },
      "Leads retrieved successfully",
    ),
  );
});

// Get lead by ID
const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role");

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // Role-based access control
  if (req.user.role === "Developer" && lead.assignedTo?.toString() !== req.user.id) {
    throw new ApiError(403, "Access denied");
  }

  // Get attachments
  const attachments = await Attachment.find({ leadId: lead._id }).populate("uploadedBy", "name email");

  res.json(new ApiResponse(200, { ...lead.toObject(), attachments }, "Lead retrieved successfully"));
});

// Update lead
const updateLead = asyncHandler(async (req, res) => {
  const { error, value } = updateLeadSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // Role-based access control
  if (req.user.role === "Developer") {
    throw new ApiError(403, "Developers cannot update leads");
  }

  const oldValues = lead.toObject();
  const updatedLead = await Lead.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true })
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  await createAuditLog(req.user.id, "UPDATE", "Lead", lead._id, oldValues, updatedLead);

  res.json(new ApiResponse(200, updatedLead, "Lead updated successfully"));
});

// Delete lead
const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // Only Admin can delete leads
  if (req.user.role !== "Admin") {
    throw new ApiError(403, "Only admins can delete leads");
  }

  await Lead.findByIdAndDelete(req.params.id);
  await createAuditLog(req.user.id, "DELETE", "Lead", lead._id, lead, null);

  res.json(new ApiResponse(200, null, "Lead deleted successfully"));
});

// Assign developer to lead
const assignDeveloper = asyncHandler(async (req, res) => {
  const { error, value } = assignDeveloperSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // Only Admin and BD can assign developers
  if (!["Admin", "BD"].includes(req.user.role)) {
    throw new ApiError(403, "Access denied");
  }

  const oldValues = lead.toObject();
  const updatedLead = await Lead.findByIdAndUpdate(
    req.params.id,
    { assignedTo: value.developerId },
    { new: true, runValidators: true },
  )
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  await createAuditLog(req.user.id, "ASSIGN", "Lead", lead._id, oldValues, updatedLead);

  res.json(new ApiResponse(200, updatedLead, "Developer assigned successfully"));
});

// Update lead status
const updateLeadStatus = asyncHandler(async (req, res) => {
  const { error, value } = statusUpdateSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // Check valid transitions
  const allowedTransitions = validTransitions[lead.status] || [];
  if (!allowedTransitions.includes(value.status)) {
    throw new ApiError(400, `Cannot transition from ${lead.status} to ${value.status}`);
  }

  const oldValues = lead.toObject();
  const updatedLead = await Lead.findByIdAndUpdate(
    req.params.id,
    { status: value.status },
    { new: true, runValidators: true },
  )
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  await createAuditLog(req.user.id, "STATUS_UPDATE", "Lead", lead._id, oldValues, updatedLead);

  // Emit Socket.IO event (if socket is available)
  if (req.io) {
    req.io.emit("leadStatusUpdated", updatedLead);
  }

  res.json(new ApiResponse(200, updatedLead, "Lead status updated successfully"));
});

// Upload attachment
const uploadAttachment = asyncHandler(async (req, res) => {
  const upload_single = upload.single("file");

  upload_single(req, res, async (err) => {
    if (err) {
      throw new ApiError(400, err.message);
    }

    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    const attachment = await Attachment.create({
      leadId: req.params.id,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id,
    });

    const populatedAttachment = await Attachment.findById(attachment._id).populate("uploadedBy", "name email");

    await createAuditLog(req.user.id, "UPLOAD_ATTACHMENT", "Lead", lead._id, null, attachment);

    res.status(201).json(new ApiResponse(201, populatedAttachment, "File uploaded successfully"));
  });
});

export {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignDeveloper,
  updateLeadStatus,
  uploadAttachment,
};
