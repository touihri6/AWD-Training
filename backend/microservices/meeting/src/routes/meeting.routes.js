const { Router } = require('express');
const meetingController = require('../controllers/meeting.controller');

const router = Router();

// GET /api/meetings/hello
router.get('/hello', meetingController.hello);

router.get('/candidates/:id', meetingController.findCandidate);

router.get('/', meetingController.findAll);
router.get('/:id', meetingController.findById);
router.post('/', meetingController.create);
router.put('/:id', meetingController.update);
router.delete('/:id', meetingController.remove);

module.exports = router;
