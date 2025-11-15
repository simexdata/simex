
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { startOfWeek, endOfWeek, toISODate, parseISODate, formatBGFull, isoWeek } from '../utils/dates.js'
import { sumWeekHours, calcPayslip } from '../utils/payroll.js'
import { exportTimesheetToXLSX, exportPayslipToXLSX, exportPayslipToPDF } from '../utils/export.js'

export default function TimesheetPanel({ employee, dataset, weekStartISO, setWeekStartISO }){
  const railRef = React.useRef(null)
  const btnRefs = React.useRef({})
  const records=(dataset?.[employee.id]?.[weekStartISO])||[]
  const {totals,total}=sumWeekHours(records)
  const endISO = toISODate(endOfWeek(parseISODate(weekStartISO)))
  const p = calcPayslip(dataset, employee, weekStartISO, endISO, { eurRate })
  const other = Array.isArray(deductions)? deductions.reduce((a,x)=>a+Number(x.amount||0),0):0
  const netAdj = (p.net||0) - other
  const weekLabel=useMemo(()=>`Седмица ${isoWeek(parseISODate(weekStartISO))}`,[weekStartISO])
  const handleExport=()=>exportTimesheetToXLSX(employee,weekStartISO,records)
  const makeWeeks=(centerISO)=>{const base=parseISODate(centerISO);const res=[];for(let i=-1;i<=1;i++){const d=new Date(base);d.setDate(d.getDate()+i*7);const s=toISODate(startOfWeek(d));if(!res.includes(s))res.push(s)}return res}
  const weekList=useMemo(()=>makeWeeks(weekStartISO),[weekStartISO])
  const go=(dir)=>{ const d=parseISODate(weekStartISO); d.setDate(d.getDate()+dir*7); setWeekStartISO(toISODate(startOfWeek(d))) }
  return (<motion.div className="ts-panel" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}} transition={{duration:.22}}>
    <div className="ts-head">
      <div className="ts-left"><strong>Таймшийт</strong></div>
      <div className="ts-actions"></div>
    </div>
    <div className="ts-weekbar scroller" role="tablist" aria-label="Седмици">
      <button className="btn nav" onClick={()=>go(-1)}>←</button>
      <div className="weeks-rail" ref={railRef}>
        {weekList.map(s=>{const w=isoWeek(parseISODate(s));const active=s===weekStartISO;return (<button className={`chip ${active?'active':''}`} key={s} ref={el=>{if(el) btnRefs.current[s]=el}} role="tab" aria-selected={active} className={`chip ${active?'active':''}`} onClick={()=>btnRefs.current[s]?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})} title={`Седмица ${w} · ${s}`}>{`${w}`}</button>
        )})}
      </div>
      <button className="btn nav" onClick={()=>go(1)}>→</button>
    </div>
    <div className="ts-title-large">{weekLabel} · {formatBGFull(parseISODate(weekStartISO))} — {formatBGFull(endOfWeek(parseISODate(weekStartISO)))}</div>
    <div className="ts-table">
      <div className="ts-thead"><div>Проект</div><div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Нд</div><div>Общо</div></div>
      <div className="ts-tbody">{records.map((r,idx)=>{const rowTotal=(r.mon||0)+(r.tue||0)+(r.wed||0)+(r.thu||0)+(r.fri||0)+(r.sat||0)+(r.sun||0);return (
        <div className="ts-row" key={r.project+idx}>
          <div className="cell strong">{r.project}</div><div className="cell">{r.mon||0}</div><div className="cell">{r.tue||0}</div><div className="cell">{r.wed||0}</div><div className="cell">{r.thu||0}</div><div className="cell">{r.fri||0}</div><div className="cell">{r.sat||0}</div><div className="cell">{r.sun||0}</div><div className="cell">{rowTotal}</div>
        </div>)})}
        {records.length===0&&(<div className="ts-empty muted">Няма данни за тази седмица.</div>)}
      </div>
      <div className="ts-foot"><div className="cell strong">Общо</div><div className="cell">{totals.mon}</div><div className="cell">{totals.tue}</div><div className="cell">{totals.wed}</div><div className="cell">{totals.thu}</div><div className="cell">{totals.fri}</div><div className="cell">{totals.sat}</div><div className="cell">{totals.sun}</div><div className="cell">{total}</div></div>
    </div>

<div className="payslip-card" style={{marginTop:16, padding:12, border:'1px solid var(--line,#e5e7eb)', borderRadius:12}}>
  <div className="section-title" style={{marginBottom:8}}>Седмичен пейслип</div>
  <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
    <div><strong>Часова ставка (лв/ч):</strong> {employee.hourlyRate?.toFixed?.(2)||0}</div>
    <div><strong>Часова ставка (€ /ч):</strong> {eurRate?.toFixed?.(2)||0}</div>
    <div><strong>Общо часове:</strong> {total?.toFixed?.(2)||0}</div>
    <div><strong>Бруто:</strong> {p.gross?.toFixed?.(2)} лв</div>
    <div><strong>Данъци:</strong> {p.taxes?.toFixed?.(2)} лв</div>
    <div><strong>Осигуровки:</strong> {p.insurance?.toFixed?.(2)} лв</div>
    <div><strong>Други удръжки:</strong> {other?.toFixed?.(2)} лв</div>
    <div style={{fontWeight:600}}><strong>Нетно:</strong> {netAdj?.toFixed?.(2)} лв</div>
  </div>
  <div style={{display:'flex',gap:8,marginTop:10,alignItems:'center',flexWrap:'wrap'}}>
    <label className="muted">Коефициент €/ч:</label>
    <input className="input" type="number" step="0.01" style={{width:120}} value={eurRate} onChange={e=>{ const v=Number(e.target.value||0); setEurRate(v); try{ const ov=JSON.parse(localStorage.getItem('eurRateOverrides')||'{}'); ov[employee.id]=v; localStorage.setItem('eurRateOverrides',JSON.stringify(ov)); }catch{} }} />
    <button className="btn ghost" onClick={()=>exportPayslipToXLSX({ ...p, eurRate, other, net: netAdj })}>Експорт в Excel</button>
    <button className="btn ghost" onClick={()=>exportPayslipToPDF({ ...p, eurRate, other, net: netAdj })}>Експорт PDF</button>
  </div>
  <div style={{marginTop:12}}>
    <div className="muted" style={{marginBottom:6}}>Удръжки (име + сума)</div>
    <div style={{display:'grid', gap:8}}>
      {Array.isArray(deductions)&&deductions.map((d,idx)=> (
        <div key={idx} style={{display:'grid',gridTemplateColumns:'1fr 120px auto',gap:8}}>
          <input className="input" placeholder="Име" value={d.label||''} onChange={e=>{ const next=[...deductions]; next[idx]={...next[idx], label:e.target.value}; setDeductions(next); try{ const all=JSON.parse(localStorage.getItem('deductions')||'{}'); all[`${employee.id}-${weekStartISO}`]=next; localStorage.setItem('deductions', JSON.stringify(all)); }catch{} }} />
          <input className="input" type="number" step="0.01" placeholder="Сума" value={d.amount||''} onChange={e=>{ const next=[...deductions]; next[idx]={...next[idx], amount:Number(e.target.value||0)}; setDeductions(next); try{ const all=JSON.parse(localStorage.getItem('deductions')||'{}'); all[`${employee.id}-${weekStartISO}`]=next; localStorage.setItem('deductions', JSON.stringify(all)); }catch{} }} />
          <button className="btn" onClick={()=>{ const next=deductions.filter((_,i)=>i!==idx); setDeductions(next); try{ const all=JSON.parse(localStorage.getItem('deductions')||'{}'); all[`${employee.id}-${weekStartISO}`]=next; localStorage.setItem('deductions', JSON.stringify(all)); }catch{} }}>Премахни</button>
        </div>
      ))}
      <button className="btn" onClick={()=>{ const next=[...(Array.isArray(deductions)?deductions:[]), {label:'', amount:0}]; setDeductions(next); try{ const all=JSON.parse(localStorage.getItem('deductions')||'{}'); all[`${employee.id}-${weekStartISO}`]=next; localStorage.setItem('deductions', JSON.stringify(all)); }catch{} }}>+ Добави удръжка</button>
    </div>
  </div>
</div>

</motion.div>)
}
