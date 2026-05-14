import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, GitBranch, Code2, Lock, Eye, ArrowRight, CheckCircle2 } from 'lucide-react';
import './Landing.css';

const features = [
  { icon: Shield, color: '#ff3b5c', title: 'Security Auditing', desc: 'Deep vulnerability scanning using OWASP Top 10 and CWE classification. Trace attack vectors, not just syntax.' },
  { icon: Zap, color: '#ffd600', title: 'Performance Analysis', desc: 'Detect O(n²) algorithms, N+1 queries, blocking I/O patterns, and memory leaks before they hit production.' },
  { icon: Code2, color: '#00f5ff', title: 'Monaco Editor', desc: "VS Code's engine in your browser. Syntax highlighting, line numbers, and professional code viewing UX." },
  { icon: Eye, color: '#a855f7', title: 'Diff Viewer', desc: 'One-click refactor with a side-by-side diff — see exactly what changed and why.' },
  { icon: GitBranch, color: '#00ff88', title: 'GitHub Integration', desc: 'Connect your repos, browse file trees, and run audits on any file without leaving the tool.' },
  { icon: Lock, color: '#ff6b35', title: 'Groq-Powered AI', desc: 'Specialized security-focused system prompts guide LLaMA 3.3 to reason about vulnerabilities at expert level.' },
];

const stackBadges = ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'Groq AI', 'LLaMA 3.3', 'Monaco Editor', 'Docker'];

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            AI-POWERED SECURITY AUDITOR
          </div>
          <h1 className="hero-title">
            <span className="title-line">Your Code Has</span>
            <span className="title-line accent">Blind Spots.</span>
            <span className="title-line">We Find Them.</span>
          </h1>
          <p className="hero-desc">
            Sentinel uses specialized LLM prompts trained to reason about attack vectors, CWE classifications,
            and real exploitability — not just pattern matching. Paste code or connect GitHub in seconds.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="cta-primary">
              Start Auditing Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="cta-secondary">Sign In</Link>
          </div>
          <div className="hero-checks">
            {['Free Groq AI tier', 'No credit card required', 'Docker-ready'].map(t => (
              <span key={t} className="hero-check"><CheckCircle2 size={14} color="#00ff88" /> {t}</span>
            ))}
          </div>
        </div>
        <div className="hero-terminal">
          <div className="terminal-header">
            <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
            <span className="terminal-title">sentinel_audit.log</span>
          </div>
          <div className="terminal-body">
            <div className="t-line"><span className="t-red">[CRITICAL]</span> SQL Injection — CWE-89 — Line 42</div>
            <div className="t-line"><span className="t-orange">[HIGH]</span> Hardcoded secret detected — CWE-798 — Line 7</div>
            <div className="t-line"><span className="t-yellow">[MEDIUM]</span> XSS via innerHTML — CWE-79 — Line 156</div>
            <div className="t-line"><span className="t-yellow">[MEDIUM]</span> N+1 query pattern — Line 89</div>
            <div className="t-line"><span className="t-cyan">[INFO]</span> Missing CSRF protection — CWE-352</div>
            <div className="t-line t-dim">─────────────────────────────</div>
            <div className="t-line"><span className="t-green">Security Score:</span> <span className="t-red">23 / 100</span></div>
            <div className="t-line"><span className="t-green">Refactored Code:</span> <span className="t-green">Ready ✓</span></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="section-inner">
          <h2 className="section-title">Everything You Need for <span className="accent">Secure Code</span></h2>
          <div className="features-grid">
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="feature-card">
                <div className="feature-icon" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="stack-section">
        <div className="section-inner">
          <h2 className="section-title">Built With</h2>
          <div className="stack-badges">
            {stackBadges.map(b => (
              <span key={b} className="stack-badge">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div className="section-inner" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Start Auditing in <span className="accent">30 Seconds</span></h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>No setup. No credit card. Paste your first snippet and get a full security report.</p>
          <Link to="/register" className="cta-primary">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
