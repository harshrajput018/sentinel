const router = require('express').Router();
const { analyzeCode, getReview } = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.post('/analyze', auth, analyzeCode);
router.get('/:id', auth, getReview);

module.exports = router;
