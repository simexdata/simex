
import React from 'react'
export default function ScoreBadge({ value=0, size=56, stroke=6 }){
  const pct=Math.max(0,Math.min(100,Number(value)||0)); const r=(size-stroke)/2; const c=2*Math.PI*r; const dash=(pct/100)*c;
  return (<div className="score-badge" style={{width:size,height:size}} title={`Обща оценка: ${pct}`}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#e6e7eb" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke="url(#grad)" strokeWidth={stroke} fill="none" strokeDasharray={`${dash} ${c-dash}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#93c5fd"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient></defs>
    </svg>
    <div className="score-badge__label">{pct}</div>
  </div>)
}
