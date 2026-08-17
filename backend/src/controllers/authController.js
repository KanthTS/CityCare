const User = require('../models/User');
const Department = require('../models/Department');
const generateToken = require('../utils/generateToken');

// @desc Register a citizen or municipal worker
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, departmentCode, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required' });
    }
    if (!['citizen', 'worker'].includes(role)) {
      return res.status(400).json({ message: 'Role must be citizen or worker' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    let department = null;
    if (role === 'worker') {
      if (!departmentCode) {
        return res.status(400).json({ message: 'Municipal workers must select a department' });
      }
      department = await Department.findOne({ code: departmentCode.toUpperCase() });
      if (!department) return res.status(400).json({ message: 'Invalid department' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role,
      department: department ? department._id : null,
      address,
    });

    const populated = await user.populate('department', 'name code');

    res.status(201).json({
      token: generateToken(user._id, user.role),
      user: populated.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Login for all roles
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('department', 'name code');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated. Contact the administrator.' });
    }

    res.json({
      token: generateToken(user._id, user.role),
      user: user.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get logged-in user's profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('department', 'name code');
  res.json({ user: user.toSafeObject() });
};

// @desc Update logged-in user's profile
// @route PUT /api/auth/me
const updateMe = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    await user.save();
    const populated = await user.populate('department', 'name code');
    res.json({ user: populated.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateMe };
