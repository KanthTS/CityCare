const Department = require('../models/Department');

const listDepartments = async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  res.json({ departments });
};

const createDepartment = async (req, res) => {
  try {
    const { name, code, categories, description } = req.body;
    if (!name || !code) return res.status(400).json({ message: 'name and code are required' });
    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      categories: categories || [],
      description: description || '',
    });
    res.status(201).json({ department });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDepartment = async (req, res) => {
  const { name, categories, description } = req.body;
  const department = await Department.findById(req.params.id);
  if (!department) return res.status(404).json({ message: 'Department not found' });
  if (name) department.name = name;
  if (categories) department.categories = categories;
  if (description !== undefined) department.description = description;
  await department.save();
  res.json({ department });
};

const deleteDepartment = async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) return res.status(404).json({ message: 'Department not found' });
  await department.deleteOne();
  res.json({ message: 'Department removed' });
};

module.exports = { listDepartments, createDepartment, updateDepartment, deleteDepartment };
