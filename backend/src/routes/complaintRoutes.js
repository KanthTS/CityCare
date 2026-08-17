const express = require('express');
const ctrl = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/', authorize('citizen'), ctrl.createComplaint);
router.get('/', authorize('admin'), ctrl.getAllComplaints);
router.get('/mine', authorize('citizen'), ctrl.getMyComplaints);
router.get('/assigned', authorize('worker'), ctrl.getAssignedComplaints);
router.get('/map', ctrl.getMapComplaints);
router.get('/stats/citizen', authorize('citizen'), ctrl.getCitizenStats);
router.get('/stats/worker', authorize('worker'), ctrl.getWorkerStats);
router.get('/:id', ctrl.getComplaintById);

router.put('/:id/verify', authorize('admin'), ctrl.verifyComplaint);
router.put('/:id/assign', authorize('admin'), ctrl.assignWorker);
router.put('/:id/priority', authorize('admin'), ctrl.updatePriority);

router.put('/:id/accept', authorize('worker'), ctrl.acceptComplaint);
router.put('/:id/start', authorize('worker'), ctrl.startWork);
router.put('/:id/photo/:type', authorize('worker'), upload.single('image'), ctrl.uploadWorkPhoto);
router.put('/:id/resolve', authorize('worker'), ctrl.resolveComplaint);

router.put('/:id/verify-resolution', authorize('citizen'), ctrl.citizenVerifyResolution);

module.exports = router;
