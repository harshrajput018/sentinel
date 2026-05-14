import React from 'react';

const getColor = (score) => {
  if (score >= 80) return '#00ff88';
  if (score >= 60) return '#ffd600';
  if (score >= 40) return '#ff6b35';
  return '#ff3b5c';
};

export default function ScoreRing({ score, label, size = 100 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getColor(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e1e40" strokeWidth={8} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.3s', filter: `drop-shadow(0 0 8px ${color})` }}
        />
        <text
          x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fill: color, fontSize: size * 0.22, fontFamily: 'Space Mono', fontWeight: 700 }}
        >
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 11, color: '#8888bb', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Space Mono' }}>{label}</span>
    </div>
  );
}
