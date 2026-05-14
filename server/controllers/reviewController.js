const groq = require('../config/groq');
const Review = require('../models/Review');
const { SECURITY_AUDIT_PROMPT } = require('../utils/systemPrompts');

const detectLanguage = (code, hint) => {
  if (hint) return hint;
  if (code.includes('import React') || code.includes('useState')) return 'javascript';
  if (code.includes('def ') && code.includes(':') && !code.includes('{')) return 'python';
  if (code.includes('public class') || code.includes('System.out')) return 'java';
  if (code.includes('package main') || (code.includes('func ') && code.includes('fmt.'))) return 'go';
  if (code.includes('#include') || code.includes('std::')) return 'cpp';
  if (/SELECT|INSERT|UPDATE|DELETE/i.test(code) && !code.includes('{')) return 'sql';
  return 'javascript';
};

exports.analyzeCode = async (req, res) => {
  const startTime = Date.now();
  const { code, language, title } = req.body;

  if (!code || code.trim().length < 10) {
    return res.status(400).json({ error: 'Please provide valid code to analyze.' });
  }
  if (code.length > 50000) {
    return res.status(400).json({ error: 'Code too large. Max 50,000 characters.' });
  }

  const detectedLang = detectLanguage(code, language);
  const review = new Review({
    userId: req.user._id,
    title: title || `${detectedLang.toUpperCase()} Review`,
    language: detectedLang,
    originalCode: code,
    source: 'paste',
    status: 'processing'
  });
  await review.save();

  try {
    const userPrompt = `Analyze the following ${detectedLang} code:\n\n\`\`\`${detectedLang}\n${code}\n\`\`\`\n\nRespond with ONLY valid JSON. No markdown, no preamble.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SECURITY_AUDIT_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 4096,
    });

    let rawResponse = completion.choices[0]?.message?.content || '{}';
    rawResponse = rawResponse.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let result;
    try {
      result = JSON.parse(rawResponse);
    } catch {
      throw new Error('AI returned malformed response. Please retry.');
    }

    review.issues = result.issues || [];
    review.securityScore = result.securityScore ?? 50;
    review.performanceScore = result.performanceScore ?? 50;
    review.qualityScore = result.qualityScore ?? 50;
    review.summary = result.summary || 'Analysis complete.';
    review.refactoredCode = result.refactoredCode || code;
    review.status = 'completed';
    review.processingTime = Date.now() - startTime;
    await review.save();

    await req.user.updateOne({ $inc: { reviewCount: 1 } });

    res.json({
      success: true,
      reviewId: review._id,
      summary: review.summary,
      securityScore: review.securityScore,
      performanceScore: review.performanceScore,
      qualityScore: review.qualityScore,
      issues: review.issues,
      refactoredCode: review.refactoredCode,
      processingTime: review.processingTime,
      language: detectedLang
    });
  } catch (err) {
    review.status = 'failed';
    await review.save();
    console.error('Analysis error:', err.message);
    res.status(500).json({ error: err.message || 'AI analysis failed. Please try again.' });
  }
};

exports.getReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
