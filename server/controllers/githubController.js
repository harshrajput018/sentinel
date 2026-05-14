const axios = require('axios');
const groq = require('../config/groq');
const Review = require('../models/Review');
const { SECURITY_AUDIT_PROMPT } = require('../utils/systemPrompts');

exports.listRepos = async (req, res) => {
  try {
    const token = req.headers['x-github-token'];
    if (!token) return res.status(400).json({ error: 'GitHub token required.' });

    const { data } = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
      params: { sort: 'updated', per_page: 30 }
    });

    res.json(data.map(r => ({
      id: r.id, name: r.name, fullName: r.full_name,
      private: r.private, language: r.language,
      description: r.description, updatedAt: r.updated_at
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repositories: ' + err.message });
  }
};

exports.getFileTree = async (req, res) => {
  try {
    const token = req.headers['x-github-token'];
    const { owner, repo, path = '' } = req.params;

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const { data } = await axios.get(url, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
    });

    res.json(Array.isArray(data) ? data.map(f => ({
      name: f.name, path: f.path, type: f.type, size: f.size
    })) : data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch file tree: ' + err.message });
  }
};

exports.analyzeFile = async (req, res) => {
  try {
    const token = req.headers['x-github-token'];
    const { owner, repo, filePath } = req.body;

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const { data } = await axios.get(url, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
    });

    const code = Buffer.from(data.content, 'base64').toString('utf-8');
    const ext = filePath.split('.').pop();
    const langMap = { js: 'javascript', ts: 'typescript', py: 'python', java: 'java', go: 'go', cpp: 'cpp', rb: 'ruby', php: 'php' };
    const language = langMap[ext] || ext;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SECURITY_AUDIT_PROMPT },
        { role: 'user', content: `Analyze this ${language} file from GitHub (${owner}/${repo}/${filePath}):\n\n\`\`\`${language}\n${code.slice(0, 20000)}\n\`\`\`\n\nRespond with ONLY valid JSON.` }
      ],
      temperature: 0.2,
      max_tokens: 4096,
    });

    let rawResponse = completion.choices[0]?.message?.content || '{}';
    rawResponse = rawResponse.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const result = JSON.parse(rawResponse);

    const review = new Review({
      userId: req.user._id,
      title: `${repo}/${filePath}`,
      language,
      originalCode: code,
      refactoredCode: result.refactoredCode || code,
      source: 'github',
      githubRepo: `${owner}/${repo}`,
      githubFile: filePath,
      issues: result.issues || [],
      securityScore: result.securityScore ?? 50,
      performanceScore: result.performanceScore ?? 50,
      qualityScore: result.qualityScore ?? 50,
      summary: result.summary || '',
      status: 'completed'
    });
    await review.save();

    res.json({
      success: true,
      reviewId: review._id,
      ...result,
      language,
      code
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
