const router = require('express').Router();
const { listRepos, getFileTree, analyzeFile } = require('../controllers/githubController');
const auth = require('../middleware/auth');

router.get('/repos', auth, listRepos);
router.get('/tree/:owner/:repo/:path*', auth, getFileTree);
router.post('/analyze', auth, analyzeFile);

module.exports = router;
