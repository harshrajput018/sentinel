const Review = require('../models/Review');

exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ userId: req.user._id, status: 'completed' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-originalCode -refactoredCode'),
      Review.countDocuments({ userId: req.user._id, status: 'completed' })
    ]);

    res.json({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id, status: 'completed' })
      .select('securityScore performanceScore qualityScore issues language createdAt');

    const total = reviews.length;
    if (total === 0) return res.json({ total: 0, avgSecurity: 0, avgPerformance: 0, avgQuality: 0, topIssueTypes: [], byLanguage: {} });

    const avgSecurity = Math.round(reviews.reduce((s, r) => s + r.securityScore, 0) / total);
    const avgPerformance = Math.round(reviews.reduce((s, r) => s + r.performanceScore, 0) / total);
    const avgQuality = Math.round(reviews.reduce((s, r) => s + r.qualityScore, 0) / total);

    const issueCounts = {};
    const byLanguage = {};
    reviews.forEach(r => {
      r.issues.forEach(i => { issueCounts[i.type] = (issueCounts[i.type] || 0) + 1; });
      byLanguage[r.language] = (byLanguage[r.language] || 0) + 1;
    });

    const topIssueTypes = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    res.json({ total, avgSecurity, avgPerformance, avgQuality, topIssueTypes, byLanguage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
