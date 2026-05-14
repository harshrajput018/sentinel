import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Trash2, ExternalLink, Shield, Clock } from 'lucide-react';
import './History.css';

export default function History() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/history?page=${page}&limit=10`);
      setReviews(data.reviews);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/api/history/${id}`);
      setReviews(r => r.filter(x => x._id !== id));
      toast.success('Review deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const scoreColor = (s) => s >= 70 ? '#00ff88' : s >= 40 ? '#ffd600' : '#ff3b5c';

  return (
    <div className="history-page">
      <div className="history-header">
        <h1 className="history-title"><Clock size={22} /> Audit History</h1>
        <span className="history-count">{pagination.total} total audits</span>
      </div>

      {loading ? (
        <div className="history-list">{[1, 2, 3].map(i => <div key={i} className="skeleton-row" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="history-empty">
          <Shield size={56} color="#1e1e40" />
          <h3>No audits yet</h3>
          <p>Run your first code security review</p>
          <Link to="/review" className="start-btn">Start Auditing</Link>
        </div>
      ) : (
        <>
          <div className="history-list">
            {reviews.map(r => (
              <div key={r._id} className="history-row">
                <div className="history-row-left">
                  <span className="lang-badge">{r.language}</span>
                  <div className="history-info">
                    <span className="history-title-text">{r.title}</span>
                    <div className="history-meta">
                      <span>{r.issues?.length || 0} issues</span>
                      <span>•</span>
                      <span>{r.source === 'github' ? '🐙 GitHub' : '📋 Paste'}</span>
                      <span>•</span>
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="history-row-right">
                  <div className="score-pill" style={{ color: scoreColor(r.securityScore), borderColor: scoreColor(r.securityScore) + '44', background: scoreColor(r.securityScore) + '11' }}>
                    {r.securityScore} sec
                  </div>
                  <Link to={`/review/${r._id}`} className="icon-btn" title="View Review"><ExternalLink size={16} /></Link>
                  <button className="icon-btn danger" onClick={() => handleDelete(r._id)} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => fetchHistory(p)}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
