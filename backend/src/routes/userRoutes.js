const express = require('express');
const ctrl = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/citizens', ctrl.listCitizens);
router.get('/workers', ctrl.listWorkers);
router.post('/workers', ctrl.createWorker);
router.put('/:id/status', ctrl.setUserStatus);
router.delete('/:id', ctrl.deleteUser);

module.exports = router;
