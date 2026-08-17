const express = require('express');
const ctrl = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', ctrl.listDepartments);
router.post('/', protect, authorize('admin'), ctrl.createDepartment);
router.put('/:id', protect, authorize('admin'), ctrl.updateDepartment);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteDepartment);

module.exports = router;
