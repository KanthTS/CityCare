const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');

// @desc Admin dashboard overview
// @route GET /api/analytics/overview
const getOverview = async (req, res) => {
  const [total, resolved, pending, inProgress, critical, activeWorkers, citizens, departments] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'closed' }),
    Complaint.countDocuments({ status: { $in: ['reported', 'verified', 'assigned'] } }),
    Complaint.countDocuments({ status: { $in: ['accepted', 'in_progress'] } }),
    Complaint.countDocuments({ severity: 'Critical', status: { $ne: 'closed' } }),
    User.countDocuments({ role: 'worker', isActive: true }),
    User.countDocuments({ role: 'citizen' }),
    Department.countDocuments(),
  ]);

  res.json({ overview: { total, resolved, pending, inProgress, critical, activeWorkers, citizens, departments } });
};

// @desc Complaints grouped by category / severity / status / department
// @route GET /api/analytics/breakdown
const getBreakdown = async (req, res) => {
  const [byCategory, bySeverity, byStatus, byDepartmentRaw] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Complaint.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([
      { $match: { department: { $ne: null } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: '$dept' },
      { $project: { _id: 0, department: '$dept.name', count: 1 } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.json({
    byCategory: byCategory.map((x) => ({ category: x._id, count: x.count })),
    bySeverity: bySeverity.map((x) => ({ severity: x._id, count: x.count })),
    byStatus: byStatus.map((x) => ({ status: x._id, count: x.count })),
    byDepartment: byDepartmentRaw,
  });
};

// @desc Resolution time, most reported issues, top areas, worker performance
// @route GET /api/analytics/performance
const getPerformance = async (req, res) => {
  const resolvedComplaints = await Complaint.find({ status: 'closed', resolvedAt: { $ne: null } }).select(
    'createdAt resolvedAt'
  );
  const avgResolutionHours =
    resolvedComplaints.length === 0
      ? 0
      : resolvedComplaints.reduce((sum, c) => sum + (c.resolvedAt - c.createdAt) / 36e5, 0) / resolvedComplaints.length;

  const mostReported = await Complaint.aggregate([
    { $group: { _id: '$issueType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  // Group by rounded coordinates (~110m grid) to find hotspot areas
  const topAreas = await Complaint.aggregate([
    {
      $group: {
        _id: {
          lat: { $round: [{ $multiply: ['$location.lat', 1000] }, 0] },
          lng: { $round: [{ $multiply: ['$location.lng', 1000] }, 0] },
        },
        count: { $sum: 1 },
        sampleAddress: { $first: '$location.address' },
        lat: { $first: '$location.lat' },
        lng: { $first: '$location.lng' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const workers = await User.find({ role: 'worker' }).select('name department').populate('department', 'name');
  const workerPerformance = await Promise.all(
    workers.map(async (w) => {
      const assigned = await Complaint.countDocuments({ worker: w._id });
      const completed = await Complaint.countDocuments({ worker: w._id, status: 'closed' });
      const complaints = await Complaint.find({ worker: w._id, status: 'closed', resolvedAt: { $ne: null } }).select(
        'createdAt resolvedAt'
      );
      const avgHours =
        complaints.length === 0
          ? null
          : complaints.reduce((sum, c) => sum + (c.resolvedAt - c.createdAt) / 36e5, 0) / complaints.length;
      return {
        workerId: w._id,
        name: w.name,
        department: w.department ? w.department.name : null,
        assigned,
        completed,
        avgResolutionHours: avgHours ? Math.round(avgHours * 10) / 10 : null,
      };
    })
  );

  res.json({
    avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
    mostReported: mostReported.map((x) => ({ issueType: x._id, count: x.count })),
    topAreas: topAreas.map((x) => ({ lat: x.lat, lng: x.lng, count: x.count, address: x.sampleAddress })),
    workerPerformance,
  });
};

// @desc Heat map data: all complaint coordinates with weight
// @route GET /api/analytics/heatmap
const getHeatmap = async (req, res) => {
  const points = await Complaint.find({ status: { $ne: 'closed' } }).select('location severity priority status');
  res.json({
    points: points.map((p) => ({
      lat: p.location.lat,
      lng: p.location.lng,
      severity: p.severity,
      priority: p.priority,
      status: p.status,
    })),
  });
};

module.exports = { getOverview, getBreakdown, getPerformance, getHeatmap };
