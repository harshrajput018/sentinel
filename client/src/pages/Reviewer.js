import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Shield, Play, Code2, GitCompare, ChevronDown, Loader2 } from 'lucide-react';
import ScoreRing from '../components/ScoreRing';
import IssueCard from '../components/IssueCard';
import './Reviewer.css';

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'go', 'cpp', 'php', 'ruby', 'sql', 'rust'];

const SAMPLE_CODE = `// Paste your code here or try this vulnerable example:
const express = require('express');
const mysql = require('mysql');
const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123', // Hardcoded credential!
  database: 'users'
});

app.get('/user', (req, res) => {
  const id = req.query.id;
  // SQL Injection vulnerability!
  const query = 'SELECT * FROM users WHERE id = ' + id;
  db.query(query, (err, results) => {
    res.json(results);
  });
});

app.post('/login', (req, res) => {
  const { user, pass } = req.body;
  const q = \`SELECT * FROM accounts WHERE username='\${user}' AND password='\${pass}'\`;
  db.query(q, (err, r) => {
    if (r.length > 0) res.json({ token: 'admin_token_hardcoded' });
    else res.status(401).send('Unauthorized');
  });
});`;

export default function Reviewer() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('issues');
  const resultsRef = useRef(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return toast.error('Please paste some code first');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/api/review/analyze', { code, language, title });
      setResult(data);
      toast.success(`Analysis complete — ${data.issues.length} issues found`);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const criticalCount = result?.issues?.filter(i => i.severity === 'critical').length || 0;
  const highCount = result?.issues?.filter(i => i.severity === 'high').length || 0;

  return (
    <div className="reviewer-page">
      <div className="reviewer-header">
        <div>
          <h1 className="reviewer-title"><Shield size={22} /> Code Security Reviewer</h1>
          <p className="reviewer-sub">Paste your code, select language, and let AI find vulnerabilities</p>
        </div>
        <div className="reviewer-controls">
          <div className="select-wrap">
            <select value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>
          <input
            type="text" placeholder="Review title (optional)"
            value={title} onChange={e => setTitle(e.target.value)}
            className="title-input"
          />
          <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
            {loading ? <><Loader2 size={16} className="spin" /> Analyzing...</> : <><Play size={16} /> Run Audit</>}
          </button>
        </div>
      </div>

      <div className="editor-container">
        <div className="editor-label"><Code2 size={14} /> Editor — {language}</div>
        <Editor
          height="420px"
          language={language}
          value={code}
          onChange={val => setCode(val || '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'Space Mono', monospace",
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            wordWrap: 'on',
            smoothScrolling: true,
          }}
        />
      </div>

      {loading && (
        <div className="analyzing-banner">
          <Loader2 size={20} className="spin" />
          <span>Sentinel AI is auditing your code for vulnerabilities, performance issues, and security flaws...</span>
        </div>
      )}

      {result && (
        <div className="results-section" ref={resultsRef}>
          {/* Summary Banner */}
          <div className="result-summary">
            <div className="summary-text">
              <h3>Audit Complete</h3>
              <p>{result.summary}</p>
              {criticalCount > 0 && (
                <div className="critical-banner">
                  ⚠️ {criticalCount} CRITICAL {criticalCount === 1 ? 'vulnerability' : 'vulnerabilities'} found — immediate action required
                </div>
              )}
            </div>
            <div className="score-rings">
              <ScoreRing score={result.securityScore} label="Security" />
              <ScoreRing score={result.performanceScore} label="Performance" />
              <ScoreRing score={result.qualityScore} label="Quality" />
            </div>
          </div>

          {/* Issue stats */}
          <div className="issue-stats">
            {['critical', 'high', 'medium', 'low', 'info'].map(sev => {
              const count = result.issues.filter(i => i.severity === sev).length;
              const colors = { critical: '#ff3b5c', high: '#ff6b35', medium: '#ffd600', low: '#00ff88', info: '#00f5ff' };
              return count > 0 ? (
                <div key={sev} className="stat-badge" style={{ borderColor: colors[sev] + '44', background: colors[sev] + '11' }}>
                  <span style={{ color: colors[sev], fontWeight: 700, fontSize: 20 }}>{count}</span>
                  <span style={{ color: colors[sev], fontSize: 11, textTransform: 'uppercase', fontFamily: 'Space Mono' }}>{sev}</span>
                </div>
              ) : null;
            })}
          </div>

          {/* Tabs */}
          <div className="result-tabs">
            <button className={`tab ${activeTab === 'issues' ? 'active' : ''}`} onClick={() => setActiveTab('issues')}>
              <Shield size={14} /> Issues ({result.issues.length})
            </button>
            <button className={`tab ${activeTab === 'diff' ? 'active' : ''}`} onClick={() => setActiveTab('diff')}>
              <GitCompare size={14} /> One-Click Refactor
            </button>
          </div>

          {activeTab === 'issues' && (
            <div className="issues-list">
              {result.issues.length === 0
                ? <div className="no-issues">🎉 No issues found — this code looks clean!</div>
                : result.issues.map((issue, i) => <IssueCard key={i} issue={issue} index={i} />)
              }
            </div>
          )}

          {activeTab === 'diff' && result.refactoredCode && (
            <div className="diff-container">
              <div className="diff-header">
                <span className="diff-label original">Original Code</span>
                <span className="diff-label refactored">Refactored (AI Fixed)</span>
              </div>
              <div className="diff-wrap">
                <ReactDiffViewer
                  oldValue={result.refactoredCode === code ? '// No changes needed' : code}
                  newValue={result.refactoredCode}
                  splitView={true}
                  useDarkTheme={true}
                  hideLineNumbers={false}
                  leftTitle="Original"
                  rightTitle="Refactored by Sentinel AI"
                  styles={{
                    variables: {
                      dark: {
                        diffViewerBackground: '#0d0d1a',
                        diffViewerColor: '#e8e8ff',
                        addedBackground: 'rgba(0,255,136,0.08)',
                        addedColor: '#e8e8ff',
                        removedBackground: 'rgba(255,59,92,0.08)',
                        removedColor: '#e8e8ff',
                        wordAddedBackground: 'rgba(0,255,136,0.2)',
                        wordRemovedBackground: 'rgba(255,59,92,0.2)',
                        gutterBackground: '#111128',
                        gutterColor: '#555599',
                        addedGutterBackground: 'rgba(0,255,136,0.15)',
                        removedGutterBackground: 'rgba(255,59,92,0.15)',
                        codeFoldBackground: '#0d0d1a',
                        codeFoldGutterBackground: '#111128',
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
