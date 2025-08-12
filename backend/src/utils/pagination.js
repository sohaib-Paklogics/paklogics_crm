// utils/pagination.js

export const getPagination = (page, limit) => {
  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * pageSize;

  return {
    skip,
    limit: pageSize,
    page: pageNumber
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
      hasPrev: pageNumber > 1
    }
  };
};

export function buildFilter(query, searchableFields = []) {
  const filter = {
    deletedAt: { $exists: false },
  };

  // Generic search across multiple fields
  if (query.search) {
    filter.$or = searchableFields.map((field) => ({
      [field]: { $regex: query.search, $options: "i" },
    }));
  }

  // Add status filter if it's not "all"
  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  return filter;
}