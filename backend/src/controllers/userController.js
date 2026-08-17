const User = require('../models/User');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');

// @desc Admin: list all citizens
// @route GET /api/users/citizens
const listCitizens = async (req, res) => {
  const citizens = await User.find({ role: 'citizen' }).sort({ createdAt: -1 });
  res.json({ citizens });
};

// @desc Admin: list all municipal workers
// @route GET /api/users/workers
const listWorkers = async (req, res) => {
  const workers = await User.find({ role: 'worker' }).populate('department', 'name code').sort({ createdAt: -1 });

  const withStats = await Promise.all(
    workers.map(async (w) => {
      const complaints = await Complaint.find({ worker: w._id });
      const completed = complaints.filter((c) => ['resolved', 'closed'].includes(c.status)).length;
      const pending = complaints.filter((c) => !['resolved', 'closed'].includes(c.status)).length;
      return { ...w.toSafeObject(), stats: { total: complaints.length, completed, pending } };
    })
  );
  res.json({ workers: withStats });
};

// @desc Admin: create a municipal worker account directly
// @route POST /api/users/workers
const createWorker = async (req, res) => {
  try {
    const { name, email, password, phone, departmentCode } = req.body;
    if (!name || !email || !password || !departmentCode) {
      return res.status(400).json({ message: 'name, email, password and departmentCode are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const department = await Department.findOne({ code: departmentCode.toUpperCase() });
    if (!department) return res.status(400).json({ message: 'Invalid department' });

    const worker = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'worker',
      department: department._id,
    });
    const populated = await worker.populate('department', 'name code');
    res.status(201).json({ worker: populated.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Admin: activate/deactivate a user
// @route PUT /api/users/:id/status
const setUserStatus = async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ message: 'Cannot modify admin accounts' });
  user.isActive = !!isActive;
  await user.save();
  res.json({ user: user.toSafeObject() });
};

// @desc Admin: delete a user
// @route DELETE /api/users/:id
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin accounts' });
  await user.deleteOne();
  res.json({ message: 'User removed' });
};

module.exports = { listCitizens, listWorkers, createWorker, setUserStatus, deleteUser };
