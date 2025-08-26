// utils/pagination.js

import mongoose from "mongoose";

export const getPagination = (page, limit) => {
  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * pageSize;

  return {
    skip,
    limit: pageSize,
    page: pageNumber,
  };
};

export const paginate = (data, page, limit, total) => {
  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;

  return {
    data,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize),
      hasNext: pageNumber * pageSize < total,
      hasPrev: pageNumber > 1,
    },
  };
};

export function buildFilter(q, searchableFields = []) {
  const filter = {
    deletedAt: { $exists: false }, // exclude hard-deleted docs
  };

  // 🔍 Generic search across multiple fields
  if (q.search) {
    filter.$or = searchableFields.map((field) => ({
      [field]: { $regex: q.search, $options: "i" },
    }));
  }

  // 🟢 Lifecycle status
  if (q.status && q.status !== "all") {
    // Explicit request: active | delayed | deleted
    filter["status.value"] = q.status;
  } else {
    // Default: exclude deleted
    filter["status.value"] = { $ne: "deleted" };
  }

  // 🎯 Lead-specific filters
  if (q.source) filter.source = q.source;
  if (q.stage && q.stage !== "all") filter.stage = q.stage;
  if (q.assignedTo) filter.assignedTo = new mongoose.Types.ObjectId(q.assignedTo);
  if (q.createdBy) filter.createdBy = new mongoose.Types.ObjectId(q.createdBy);

  // 📅 Date range
  if (q.dateFrom || q.dateTo) {
    filter.createdAt = {};
    if (q.dateFrom) filter.createdAt.$gte = new Date(q.dateFrom);
    if (q.dateTo) filter.createdAt.$lte = new Date(q.dateTo);
  }

  return filter;
}
