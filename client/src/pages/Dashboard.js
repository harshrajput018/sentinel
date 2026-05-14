import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Code2, TrendingUp, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/history/stats/overview'),
      api.get('/api/history?limit=5')
    ]).then(([s, h]) => {
      setStats(s.data);
      setRecent(h.data.reviews || []);
    }).finally(() => setLoading(false));
  }, []);

  const langData = stats ? Object.entries(stats.byLanguage || {}).map(([lang, count]) => ({ lang, count })) : [];

  return (
    <div className="dashboard-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Welcome back, <span className="accent">@{user?.username}</span></h1>
          <p className="dash-sub">Here's your security audit overview</p>
        </div>
        <Link to="/review" className="new-review-btn">
          <Shield size={16} /> New Audit <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)' }}>
                <Code2 size={20} color="#00f5ff" />
              </div>
              <div>
                <div className="stat-value">{stats?.total || 0}</div>
                <div className="stat-label">Total Audits</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
                <Shield size={20} color="#00ff88" />
              </div>
              <div>
                <div className="stat-value" style={{ color: stats?.avgSecurity >= 70 ? '#00ff88' : stats?.avgSecurity >= 40 ? '#ffd600' : '#ff3b5c' }}>
                  {stats?.avgSecurity || 0}
                </div>
                <div className="stat-label">Avg Security Score</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(255,214,0,0.1)', border: '1px solid rgba(255,214,0,0.3)' }}>
                <TrendingUp size={20} color="#ffd600" />
              </div>
              <div>
                <div className="stat-value">{stats?.avgPerformance || 0}</div>
                <div className="stat-label">Avg Performance</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)' }}>
                <AlertTriangle size={20} color="#ff3b5c" />
              </div>
              <div>
                <div className="stat-value">
                  {stats?.topIssueTypes?.[0]?.count || 0}
                </div>
                <div className="stat-label">Top Issue: {stats?.topIssueTypes?.[0]?.type || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="dash-grid-2">
            {/* Recent Reviews */}
            <div className="dash-card">
              <div className="card-header">
                <h3>Recent Audits</h3>
                <Link to="/history" className="card-link">View all →</Link>
              </div>
              {recent.length === 0 ? (
                <div className="empty-state">
                  <Shield size={40} color="#1e1e40" />
                  <p>No audits yet. Run your first code review!</p>
                  <Link to="/review" className="new-review-btn" style={{ marginTop: 12 }}>Start Auditing</Link>
                </div>
              ) : (
                <div className="recent-list">
                  {recent.map(r => (
                    <Link key={r._id} to={`/review/${r._id}`} className="recent-item">
                      <div className="recent-left">
                        <span className="recent-lang">{r.language}</span>
                        <span className="recent-title">{r.title}</span>
                        <span className="recent-issues">{r.issues?.length || 0} issues</span>
                      </div>
                      <div className="recent-score" style={{
                        color: r.securityScore >= 70 ? '#00ff88' : r.securityScore >= 40 ? '#ffd600' : '#ff3b5c'
                      }}>{r.securityScore}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Language Chart */}
            <div className="dash-card">
              <div className="card-header"><h3>Languages Reviewed</h3></div>
              {langData.length === 0 ? (
                <div className="empty-state"><p>No data yet</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={langData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="lang" tick={{ fill: '#8888bb', fontSize: 12, fontFamily: 'Space Mono' }} />
                    <YAxis tick={{ fill: '#8888bb', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: '#111128', border: '1px solid #1e1e40', borderRadius: 8, fontFamily: 'Space Mono', fontSize: 12 }}
                      labelStyle={{ color: '#e8e8ff' }} itemStyle={{ color: '#00f5ff' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {langData.map((_, i) => (
                        <Cell key={i} fill={['#00f5ff', '#00ff88', '#a855f7', '#ffd600', '#ff6b35'][i % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Issue Types */}
          {stats?.topIssueTypes?.length > 0 && (
            <div className="dash-card">
              <div className="card-header"><h3>Most Common Issues</h3></div>
              <div className="issue-type-list">
                {stats.topIssueTypes.map(({ type, count }, i) => {
                  const colors = { security: '#ff3b5c', performance: '#ffd600', bug: '#ff6b35', style: '#a855f7', refactor: '#00f5ff' };
                  const max = stats.topIssueTypes[0]?.count || 1;
                  return (
                    <div key={type} className="issue-type-row">
                      <span className="issue-type-name" style={{ color: colors[type] || '#8888bb' }}>{type}</span>
                      <div className="issue-type-bar">
                        <div className="issue-type-fill" style={{ width: `${(count / max) * 100}%`, background: colors[type] || '#8888bb' }} />
                      </div>
                      <span className="issue-type-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
