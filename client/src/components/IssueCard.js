import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert, Zap, Code, Bug, Wrench } from 'lucide-react';
import './IssueCard.css';

const typeConfig = {
  security: { icon: ShieldAlert, color: '#ff3b5c', label: 'Security' },
  performance: { icon: Zap, color: '#ffd600', label: 'Performance' },
  style: { icon: Code, color: '#a855f7', label: 'Style' },
  bug: { icon: Bug, color: '#ff6b35', label: 'Bug' },
  refactor: { icon: Wrench, color: '#00f5ff', label: 'Refactor' },
};

const severityColor = {
  critical: '#ff3b5c', high: '#ff6b35', medium: '#ffd600', low: '#00ff88', info: '#00f5ff'
};

export default function IssueCard({ issue, index }) {
  const [open, setOpen] = useState(index === 0);
  const config = typeConfig[issue.type] || typeConfig.bug;
  const Icon = config.icon;
  const sColor = severityColor[issue.severity] || '#8888bb';

  return (
    <div className={`issue-card ${open ? 'open' : ''}`} style={{ '--type-color': config.color }}>
      <div className="issue-header" onClick={() => setOpen(!open)}>
        <div className="issue-header-left">
          <div className="issue-icon-wrap" style={{ background: `${config.color}22`, border: `1px solid ${config.color}44` }}>
            <Icon size={14} color={config.color} />
          </div>
          <div className="issue-meta">
            <span className="issue-title">{issue.title}</span>
            <div className="issue-tags">
              <span className="tag" style={{ background: `${config.color}22`, color: config.color, border: `1px solid ${config.color}44` }}>{config.label}</span>
              <span className="tag" style={{ background: `${sColor}22`, color: sColor, border: `1px solid ${sColor}44` }}>{issue.severity}</span>
              {issue.line && <span className="tag tag-line">Line {issue.line}</span>}
              {issue.cwe && <span className="tag tag-cwe">{issue.cwe}</span>}
            </div>
          </div>
        </div>
        <div className="issue-toggle">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
      </div>
      {open && (
        <div className="issue-body">
          <div className="issue-section">
            <h5>Description</h5>
            <p>{issue.description}</p>
          </div>
          {issue.suggestion && (
            <div className="issue-section">
              <h5>Suggestion</h5>
              <p>{issue.suggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
