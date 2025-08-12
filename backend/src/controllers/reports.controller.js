
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Lead from '../models/lead.model.js';
import User from '../models/user.model.js';
import { parse as json2csv } from 'json2csv';

// Get leads report
const getLeadsReport = asyncHandler(async (req, res) => {
  const { format } = req.query;

  // Aggregate leads by status
  const statusStats = await Lead.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Aggregate leads by source
  const sourceStats = await Lead.aggregate([
    {
      $group: {
        _id: '$source',
        count: { $sum: 1 }
      }
    }
  ]);

  // Per-user lead stats (for Admin dashboard)
  const userStats = await Lead.aggregate([
    {
      $group: {
        _id: '$createdBy',
        totalCreated: { $sum: 1 },
        statuses: {
          $push: '$status'
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        userId: '$_id',
        userName: '$user.name',
        userEmail: '$user.email',
        totalCreated: 1,
        completed: {
          $size: {
            $filter: {
              input: '$statuses',
              cond: { $eq: ['$$this', 'Completed'] }
            }
          }
        }
      }
    }
  ]);

  // Assigned developer stats
  const assignedStats = await Lead.aggregate([
    {
      $match: { assignedTo: { $exists: true } }
    },
    {
      $group: {
        _id: '$assignedTo',
        totalAssigned: { $sum: 1 },
        statuses: {
          $push: '$status'
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        userId: '$_id',
        userName: '$user.name',
        userEmail: '$user.email',
        totalAssigned: 1,
        completed: {
          $size: {
            $filter: {
              input: '$statuses',
              cond: { $eq: ['$$this', 'Completed'] }
            }
          }
        }
      }
    }
  ]);

  const reportData = {
    statusStats: statusStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    sourceStats: sourceStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    userStats,
    assignedStats,
    totalLeads: await Lead.countDocuments(),
    generatedAt: new Date()
  };

  // Return CSV format if requested
  if (format === 'csv') {
    const fields = [
      'userName',
      'userEmail',
      'totalCreated',
      'totalAssigned',
      'completed'
    ];

    // Combine creator and assigned stats
    const csvData = [];
    
    userStats.forEach(user => {
      const assigned = assignedStats.find(a => a.userId.toString() === user.userId.toString()) || {};
      csvData.push({
        userName: user.userName,
        userEmail: user.userEmail,
        totalCreated: user.totalCreated,
        totalAssigned: assigned.totalAssigned || 0,
        completed: user.completed + (assigned.completed || 0)
      });
    });

    const csv = json2csv(csvData, { fields });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads-report.csv"');
    return res.send(csv);
  }

  res.json(new ApiResponse(200, reportData, 'Report generated successfully'));
});

// Get activities report
const getActivitiesReport = asyncHandler(async (req, res) => {
  // Placeholder implementation
  const reportData = {
    totalActivities: 0,
    recentActivities: []
  };
  
  res.json(new ApiResponse(200, reportData, 'Activities report generated successfully'));
});

// Get performance report
const getPerformanceReport = asyncHandler(async (req, res) => {
  // Placeholder implementation
  const reportData = {
    totalPerformance: 0,
    metrics: []
  };
  
  res.json(new ApiResponse(200, reportData, 'Performance report generated successfully'));
});

// Export report
const exportReport = asyncHandler(async (req, res) => {
  // Placeholder implementation
  const reportData = {
    exported: true,
    timestamp: new Date()
  };
  
  res.json(new ApiResponse(200, reportData, 'Report exported successfully'));
});

export {
  getLeadsReport,
  getActivitiesReport,
  getPerformanceReport,
  exportReport
};
