import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Editor from '@monaco-editor/react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { ArrowLeft, Shield, GitCompare, Code2, Clock } from 'lucide-react';
import ScoreRing from '../components/ScoreRing';
import IssueCard from '../components/IssueCard';
import './ReviewDetail.css';

export default function ReviewDetail() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('issues');

  useEffect(() => {
    api.get(`/api/review/${id}`)
      .then(r => setReview(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#00f5ff', fontFamily: 'Space Mono' }}>
      Loading review...
    </div>
  );

  if (!review) return (
    <div style={{ text: 'center', padding: 60, color: '#ff3b5c', fontFamily: 'Space Mono', textAlign: 'center' }}>
      Review not found. <Link to="/history" style={{ color: '#00f5ff' }}>← Back to history</Link>
    </div>
  );

  return (
    <div className="detail-page">
      <div className="detail-back">
        <Link to="/history"><ArrowLeft size={16} /> Back to History</Link>
      </div>

      <div className="detail-header">
        <div>
          <div className="detail-meta">
            <span className="detail-lang">{review.language}</span>
            <span className="detail-source">{review.source === 'github' ? '🐙 GitHub' : '📋 Paste'}</span>
            <span className="detail-date"><Clock size={12} /> {new Date(review.createdAt).toLocaleString()}</span>
            {review.processingTime && <span className="detail-date">⚡ {(review.processingTime / 1000).toFixed(1)}s</span>}
          </div>
          <h1 className="detail-title">{review.title}</h1>
          {review.githubFile && <p className="detail-path">📁 {review.githubRepo}/{review.githubFile}</p>}
          <p className="detail-summary">{review.summary}</p>
        </div>
        <div className="detail-scores">
          <ScoreRing score={review.securityScore} label="Security" size={110} />
          <ScoreRing score={review.performanceScore} label="Performance" size={110} />
          <ScoreRing score={review.qualityScore} label="Quality" size={110} />
        </div>
      </div>

      <div className="detail-tabs">
        <button className={`tab ${tab === 'issues' ? 'active' : ''}`} onClick={() => setTab('issues')}>
          <Shield size={14} /> Issues ({review.issues.length})
        </button>
        <button className={`tab ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>
          <Code2 size={14} /> Original Code
        </button>
        <button className={`tab ${tab === 'diff' ? 'active' : ''}`} onClick={() => setTab('diff')}>
          <GitCompare size={14} /> Refactored Diff
        </button>
      </div>

      {tab === 'issues' && (
        <div className="detail-issues">
          {review.issues.map((issue, i) => <IssueCard key={i} issue={issue} index={i} />)}
          {review.issues.length === 0 && <div className="no-issues">🎉 No issues found!</div>}
        </div>
      )}

      {tab === 'code' && (
        <div className="detail-editor">
          <Editor
            height="500px" language={review.language} value={review.originalCode}
            theme="vs-dark" options={{ readOnly: true, fontSize: 13, fontFamily: "'Space Mono', monospace", minimap: { enabled: true }, scrollBeyondLastLine: false, padding: { top: 16 } }}
          />
        </div>
      )}

      {tab === 'diff' && review.refactoredCode && (
        <div className="detail-diff">
          <ReactDiffViewer
            oldValue={review.originalCode}
            newValue={review.refactoredCode}
            splitView={true}
            useDarkTheme={true}
            hideLineNumbers={false}
            leftTitle="Original"
            rightTitle="Refactored by Sentinel"
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
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
