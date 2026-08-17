const crypto = require('crypto');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const User = require('../models/User');
const { distanceInMeters } = require('../utils/geo');
const { notifyUser, notifyMany } = require('../utils/notify');

const DUPLICATE_RADIUS_METERS = 60;
const DUPLICATE_WINDOW_DAYS = 14;

const genComplaintId = () =>
  `CF-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

const POPULATE_FIELDS = [
  { path: 'citizen', select: 'name email phone' },
  { path: 'worker', select: 'name email phone' },
  { path: 'department', select: 'name code' },
  { path: 'affectedCitizens.citizen', select: 'name email phone' },
];

// @desc Citizen submits a complaint to municipal authority (after AI analysis)
// @route POST /api/complaints
const createComplaint = async (req, res) => {
  try {
    const {
      issueType,
      category,
      description,
      image,
      lat,
      lng,
      address,
      severity,
      priority,
      departmentCode,
      aiAnalysis,
      selfFixAttempted,
    } = req.body;

    if (!image || lat === undefined || lng === undefined || !issueType || !category) {
      return res.status(400).json({ message: 'image, issueType, category and location are required' });
    }

    const department = departmentCode
      ? await Department.findOne({ code: departmentCode.toUpperCase() })
      : await Department.findOne({ code: 'GENERAL' });

    // --- Duplicate detection: same category, open, within radius+window ---
    const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const candidates = await Complaint.find({
      category,
      status: { $ne: 'closed' },
      createdAt: { $gte: windowStart },
    });

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    let master = null;
    for (const c of candidates) {
      const dist = distanceInMeters(latNum, lngNum, c.location.lat, c.location.lng);
      if (dist <= DUPLICATE_RADIUS_METERS) {
        master = c;
        break;
      }
    }

    if (master) {
      const alreadyAffected = master.affectedCitizens.some(
        (a) => String(a.citizen) === String(req.user._id)
      );
      if (!alreadyAffected) {
        master.affectedCitizens.push({ citizen: req.user._id });
        master.history.push({
          status: master.status,
          note: 'Additional citizen report matched to this existing issue (duplicate detection).',
          actor: req.user._id,
          actorRole: 'citizen',
        });
        await master.save();

        await notifyUser(req.user._id, {
          title: 'Matched to an existing report',
          message: `Your report matches complaint ${master.complaintId}, which is already being tracked. You'll receive updates on it.`,
          type: 'info',
          relatedComplaint: master._id,
        });

        if (master.affectedCitizens.length === 3) {
          const admins = await User.find({ role: 'admin' }).select('_id');
          await notifyMany(admins.map((a) => a._id), {
            title: 'Duplicate complaints detected',
            message: `${master.affectedCitizens.length} citizens have now reported the same issue: ${master.complaintId} (${master.issueType}).`,
            type: 'warning',
            relatedComplaint: master._id,
          });
        }
      }

      const populated = await Complaint.findById(master._id).populate(POPULATE_FIELDS);
      return res.status(200).json({ duplicate: true, complaint: populated });
    }

    // --- No duplicate found: create a new complaint ---
    const complaint = await Complaint.create({
      complaintId: genComplaintId(),
      citizen: req.user._id,
      issueType,
      category,
      description: description || '',
      image,
      location: { lat: latNum, lng: lngNum, address: address || '' },
      severity: severity || 'Medium',
      priority: priority || severity || 'Medium',
      department: department ? department._id : null,
      status: 'reported',
      aiAnalysis: aiAnalysis || {},
      selfFixAttempted: !!selfFixAttempted,
      affectedCitizens: [{ citizen: req.user._id }],
      history: [
        {
          status: 'reported',
          note: 'Complaint submitted by citizen.',
          actor: req.user._id,
          actorRole: 'citizen',
        },
      ],
    });

    await notifyUser(req.user._id, {
      title: 'Complaint submitted',
      message: `Your complaint ${complaint.complaintId} (${complaint.issueType}) has been submitted and is pending verification.`,
      type: 'success',
      relatedComplaint: complaint._id,
    });

    const admins = await User.find({ role: 'admin' }).select('_id');
    await notifyMany(admins.map((a) => a._id), {
      title: severity === 'Critical' ? 'Critical issue reported' : 'New complaint reported',
      message: `${complaint.complaintId}: ${complaint.issueType} (${complaint.severity} severity) reported.`,
      type: severity === 'Critical' ? 'critical' : 'info',
      relatedComplaint: complaint._id,
    });

    const populated = await Complaint.findById(complaint._id).populate(POPULATE_FIELDS);
    res.status(201).json({ duplicate: false, complaint: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get complaints reported by / affecting the logged-in citizen
// @route GET /api/complaints/mine
const getMyComplaints = async (req, res) => {
  const complaints = await Complaint.find({ 'affectedCitizens.citizen': req.user._id })
    .populate(POPULATE_FIELDS)
    .sort({ createdAt: -1 });
  res.json({ complaints });
};

// @desc Get complaints assigned to the logged-in worker
// @route GET /api/complaints/assigned
const getAssignedComplaints = async (req, res) => {
  const complaints = await Complaint.find({ worker: req.user._id })
    .populate(POPULATE_FIELDS)
    .sort({ createdAt: -1 });
  res.json({ complaints });
};

// @desc Admin: get all complaints with optional filters
// @route GET /api/complaints
const getAllComplaints = async (req, res) => {
  const { status, category, severity, department, q } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (severity) filter.severity = severity;
  if (department) filter.department = department;
  if (q) {
    filter.$or = [
      { complaintId: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { issueType: { $regex: q, $options: 'i' } },
    ];
  }
  const complaints = await Complaint.find(filter).populate(POPULATE_FIELDS).sort({ createdAt: -1 }).limit(1000);
  res.json({ complaints });
};

// @desc Get complaints for map display (role-aware)
// @route GET /api/complaints/map
const getMapComplaints = async (req, res) => {
  let filter = {};
  if (req.user.role === 'citizen') filter = { 'affectedCitizens.citizen': req.user._id };
  else if (req.user.role === 'worker') filter = { worker: req.user._id };

  const complaints = await Complaint.find(filter)
    .select('complaintId issueType category severity priority status location createdAt')
    .limit(2000);
  res.json({ complaints });
};

// @desc Get single complaint by id
// @route GET /api/complaints/:id
const getComplaintById = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id).populate(POPULATE_FIELDS);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  if (req.user.role === 'citizen') {
    const isAffected = complaint.affectedCitizens.some((a) => String(a.citizen._id || a.citizen) === String(req.user._id));
    if (!isAffected) return res.status(403).json({ message: 'Not authorized to view this complaint' });
  }
  if (req.user.role === 'worker' && complaint.worker && String(complaint.worker._id) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to view this complaint' });
  }

  res.json({ complaint });
};

const pushHistory = (complaint, status, note, user) => {
  complaint.history.push({ status, note, actor: user._id, actorRole: user.role });
};

// @desc Admin verifies a reported complaint
// @route PUT /api/complaints/:id/verify
const verifyComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  if (complaint.status !== 'reported') return res.status(400).json({ message: 'Only reported complaints can be verified' });

  complaint.status = 'verified';
  pushHistory(complaint, 'verified', 'Complaint verified by admin.', req.user);
  await complaint.save();

  res.json({ complaint });
};

// @desc Admin assigns a complaint to a worker
// @route PUT /api/complaints/:id/assign
const assignWorker = async (req, res) => {
  const { workerId } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  if (!['verified', 'reported', 'reopened'].includes(complaint.status)) {
    return res.status(400).json({ message: 'Complaint is not in an assignable state' });
  }

  const worker = await User.findOne({ _id: workerId, role: 'worker' });
  if (!worker) return res.status(404).json({ message: 'Worker not found' });

  complaint.worker = worker._id;
  complaint.status = 'assigned';
  complaint.assignedAt = new Date();
  pushHistory(complaint, 'assigned', `Assigned to worker ${worker.name}.`, req.user);
  await complaint.save();

  await notifyUser(worker._id, {
    title: 'New complaint assigned',
    message: `You have been assigned complaint ${complaint.complaintId}: ${complaint.issueType}.`,
    type: 'info',
    relatedComplaint: complaint._id,
  });
  await notifyMany(complaint.affectedCitizens.map((a) => a.citizen), {
    title: 'Worker assigned',
    message: `A municipal worker has been assigned to your complaint ${complaint.complaintId}.`,
    type: 'info',
    relatedComplaint: complaint._id,
  });

  const populated = await Complaint.findById(complaint._id).populate(POPULATE_FIELDS);
  res.json({ complaint: populated });
};

// @desc Admin updates department and/or priority
// @route PUT /api/complaints/:id/priority
const updatePriority = async (req, res) => {
  const { priority, departmentCode } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  if (priority) {
    complaint.priority = priority;
    pushHistory(complaint, complaint.status, `Priority changed to ${priority}.`, req.user);
    await notifyMany(complaint.affectedCitizens.map((a) => a.citizen), {
      title: 'Priority updated',
      message: `The priority of your complaint ${complaint.complaintId} was changed to ${priority}.`,
      type: 'info',
      relatedComplaint: complaint._id,
    });
    if (complaint.worker) {
      await notifyUser(complaint.worker, {
        title: 'Priority changed',
        message: `Priority for complaint ${complaint.complaintId} changed to ${priority}.`,
        type: 'warning',
        relatedComplaint: complaint._id,
      });
    }
  }
  if (departmentCode) {
    const department = await Department.findOne({ code: departmentCode.toUpperCase() });
    if (!department) return res.status(400).json({ message: 'Invalid department' });
    complaint.department = department._id;
    pushHistory(complaint, complaint.status, `Department changed to ${department.name}.`, req.user);
  }

  await complaint.save();
  const populated = await Complaint.findById(complaint._id).populate(POPULATE_FIELDS);
  res.json({ complaint: populated });
};

// @desc Worker accepts an assigned complaint
// @route PUT /api/complaints/:id/accept
const acceptComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  if (String(complaint.worker) !== String(req.user._id)) return res.status(403).json({ message: 'Not your assigned complaint' });
  if (complaint.status !== 'assigned') return res.status(400).json({ message: 'Only assigned complaints can be accepted' });

  complaint.status = 'accepted';
  complaint.acceptedAt = new Date();
  pushHistory(complaint, 'accepted', 'Worker accepted the complaint.', req.user);
  await complaint.save();

  const populated = await Complaint.findById(complaint._id).populate(POPULATE_FIELDS);
  res.json({ complaint: populated });
};

// @desc Worker starts work
// @route PUT /api/complaints/:id/start
const startWork = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  if (String(complaint.worker) !== String(req.user._id)) return res.status(403).json({ message: 'Not your assigned complaint' });
  if (complaint.status !== 'accepted') return res.status(400).json({ message: 'Complaint must be accepted before starting work' });

  complaint.status = 'in_progress';
  pushHistory(complaint, 'in_progress', 'Worker started work on-site.', req.user);
  await complaint.save();

  await notifyMany(complaint.affectedCitizens.map((a) => a.citizen), {
    title: 'Work started',
    message: `Work has started on your complaint ${complaint.complaintId}.`,
    type: 'info',
    relatedComplaint: complaint._id,
  });

  const populated = await Complaint.findById(complaint._id).populate(POPULATE_FIELDS);
  res.json({ complaint: populated });
};

// @desc Worker uploads before/after photo
// @route PUT /api/complaints/:id/photo/:type(before|after)
const uploadWorkPhoto = async (req, res) => {
  const { type } = req.params;
  if (!['before', 'after'].includes(type)) return res.status(400).json({ message: 'Invalid photo type' });
  if (!req.file) return res.status(400).json({ message: 'Image file is required' });

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  if (String(complaint.worker) !== String(req.user._id)) return res.status(403).json({ message: 'Not your assigned complaint' });

  const url = `/uploads/${req.file.filename}`;
  if (type === 'before') complaint.beforeImage = url;
  else complaint.afterImage = url;

  pushHistory(complaint, complaint.status, `Worker uploaded ${type} photo.`, req.user);
  await complaint.save();

  const populated = await Complaint.findById(complaint._id).populate(POPULATE_FIELDS);
  res.json({ complaint: populated });
};

// @desc Worker marks complaint resolved
// @route PUT /api/complaints/:id/resolve
const resolveComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  if (String(complaint.worker) !== String(req.user._id)) return res.status(403).json({ message: 'Not your assigned complaint' });
  if (complaint.status !== 'in_progress') return res.status(400).json({ message: 'Complaint must be in progress to resolve' });
  if (!complaint.afterImage) return res.status(400).json({ message: 'Upload an after photo before marking resolved' });

  complaint.status = 'resolved';
  complaint.resolvedAt = new Date();
  complaint.citizenVerification = { status: 'pending', respondedAt: null };
  pushHistory(complaint, 'resolved', 'Worker marked the complaint as resolved.', req.user);
  await complaint.save();

  await notifyMany(complaint.affectedCitizens.map((a) => a.citizen), {
    title: 'Verification required',
    message: `Your complaint ${complaint.complaintId} has been marked resolved. Please verify whether the issue has actually been fixed.`,
    type: 'warning',
    relatedComplaint: complaint._id,
  });

  const populated = await Complaint.findById(complaint._id).populate(POPULATE_FIELDS);
  res.json({ complaint: populated });
};

// @desc Citizen verifies resolution
// @route PUT /api/complaints/:id/verify-resolution
const citizenVerifyResolution = async (req, res) => {
  const { resolved } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  const isAffected = complaint.affectedCitizens.some((a) => String(a.citizen) === String(req.user._id));
  if (!isAffected) return res.status(403).json({ message: 'Not authorized' });
  if (complaint.status !== 'resolved') return res.status(400).json({ message: 'Complaint is not awaiting verification' });

  if (resolved) {
    complaint.status = 'closed';
    complaint.closedAt = new Date();
    complaint.citizenVerification = { status: 'resolved', respondedAt: new Date() };
    pushHistory(complaint, 'closed', 'Citizen verified the issue is resolved. Complaint closed.', req.user);

    if (complaint.worker) {
      await notifyUser(complaint.worker, {
        title: 'Complaint closed',
        message: `Citizen confirmed resolution for ${complaint.complaintId}. Great work!`,
        type: 'success',
        relatedComplaint: complaint._id,
      });
    }
  } else {
    complaint.status = 'reopened';
    complaint.resolvedAt = null;
    complaint.citizenVerification = { status: 'not_resolved', respondedAt: new Date() };
    pushHistory(complaint, 'reopened', 'Citizen reported the issue still exists. Complaint reopened.', req.user);

    if (complaint.worker) {
      await notifyUser(complaint.worker, {
        title: 'Complaint reopened',
        message: `Citizen reported that ${complaint.complaintId} is not actually resolved. Please re-check.`,
        type: 'critical',
        relatedComplaint: complaint._id,
      });
    }
    const admins = await User.find({ role: 'admin' }).select('_id');
    await notifyMany(admins.map((a) => a._id), {
      title: 'Complaint reopened',
      message: `${complaint.complaintId} was reopened after failed citizen verification.`,
      type: 'warning',
      relatedComplaint: complaint._id,
    });
  }

  await complaint.save();
  const populated = await Complaint.findById(complaint._id).populate(POPULATE_FIELDS);
  res.json({ complaint: populated });
};

// @desc Citizen dashboard stats
// @route GET /api/complaints/stats/citizen
const getCitizenStats = async (req, res) => {
  const complaints = await Complaint.find({ 'affectedCitizens.citizen': req.user._id });
  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => ['reported', 'verified', 'assigned'].includes(c.status)).length,
    inProgress: complaints.filter((c) => ['accepted', 'in_progress'].includes(c.status)).length,
    resolved: complaints.filter((c) => ['resolved', 'closed'].includes(c.status)).length,
  };
  res.json({ stats });
};

// @desc Worker dashboard stats
// @route GET /api/complaints/stats/worker
const getWorkerStats = async (req, res) => {
  const complaints = await Complaint.find({ worker: req.user._id });
  const stats = {
    assigned: complaints.length,
    pending: complaints.filter((c) => ['assigned'].includes(c.status)).length,
    inProgress: complaints.filter((c) => ['accepted', 'in_progress'].includes(c.status)).length,
    completed: complaints.filter((c) => ['resolved', 'closed'].includes(c.status)).length,
  };
  res.json({ stats });
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAssignedComplaints,
  getAllComplaints,
  getMapComplaints,
  getComplaintById,
  verifyComplaint,
  assignWorker,
  updatePriority,
  acceptComplaint,
  startWork,
  uploadWorkPhoto,
  resolveComplaint,
  citizenVerifyResolution,
  getCitizenStats,
  getWorkerStats,
};
