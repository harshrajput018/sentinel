const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  type: { type: String, enum: ['security', 'performance', 'style', 'bug', 'refactor'], required: true },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'info'], required: true },
  line: { type: Number },
  title: { type: String, required: true },
  description: { type: String, required: true },
  suggestion: { type: String },
  cwe: { type: String }  // Common Weakness Enumeration ID
});

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled Review' },
  language: { type: String, required: true },
  originalCode: { type: String, required: true },
  refactoredCode: { type: String },
  source: { type: String, enum: ['paste', 'github'], default: 'paste' },
  githubRepo: { type: String },
  githubFile: { type: String },
  issues: [issueSchema],
  securityScore: { type: Number, min: 0, max: 100 },
  performanceScore: { type: Number, min: 0, max: 100 },
  qualityScore: { type: Number, min: 0, max: 100 },
  summary: { type: String },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  processingTime: { type: Number }
}, { timestamps: true });

reviewSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
