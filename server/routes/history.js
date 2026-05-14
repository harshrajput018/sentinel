const router = require('express').Router();
const { getHistory, deleteReview, getStats } = require('../controllers/historyController');
const auth = require('../middleware/auth');

router.get('/', auth, getHistory);
router.get('/stats/overview', auth, getStats);
router.delete('/:id', auth, deleteReview);

module.exports = router;
