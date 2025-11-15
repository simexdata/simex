
import React, { useMemo, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TimesheetPanel from './TimesheetPanel.jsx'
import PayslipPanel from './PayslipPanel.jsx'
import EditPanel from './EditPanel.jsx'
import CertificateViewer from './CertificateViewer.jsx'
import timesheets from '../data/timesheets.json'
import { startOfWeek, toISODate } from '../utils/dates.js'

export default function EmployeeCard({ employee, onUpdate }){
  const { name, email, role, department, address, phone, photo, ratings = {}, certificates = [], certificateImages = [] } = employee
  const [showPayslip,setShowPayslip]=useState(false)
  const [showMore,setShowMore]=useState(false)
  const [showEdit,setShowEdit]=useState(false)
  const [pendingCerts,setPendingCerts]=useState(certificateImages||[])
  const [certDirty,setCertDirty]=useState(false)
  useEffect(()=>{ setPendingCerts(certificateImages||[]); setCertDirty(false) },[employee?.id])
  const handleCertUpload=(e)=>{
    const files=[...e.target.files]; if(!files.length) return;
    const readers=files.map(f=>new Promise(res=>{const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(f)}))
    Promise.all(readers).then(imgs=>{ setPendingCerts(prev=>[...prev, ...imgs]); setCertDirty(true); e.target.value='' })
  }
  const handleSaveCerts=()=>{ onUpdate(employee.id,{ certificateImages: pendingCerts }); setCertDirty(false) }
  const defaultWeekISO=useMemo(()=>{const today=new Date(); return toISODate(startOfWeek(today))},[])
  const [weekStartISO,setWeekStartISO]=useState(defaultWeekISO)
  const [showCert,setShowCert]=useState(null)

  const agg=useMemo(()=>{const vals=Object.values(ratings||{}).map(Number).filter(v=>!isNaN(v));if(!vals.length)return 0;return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)},[ratings])
  const handleSaveEdit=(patch)=>{onUpdate?.(employee.id,patch);setShowEdit(false)}

  return (<article className="card" aria-labelledby={`emp-${employee.id}-name`}>
    <div className="card-head top-photo">
      <div className="left-photo-col">
        <motion.img src={photo||'https://placehold.co/240x240?text=Photo'} alt={`Снимка на ${name}`} className="avatar" initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={{duration:.25}}/>
        
      </div>
      <div className="head-right">
        <h2 id={`emp-${employee.id}-name`} className="emp-name">{name} <span className="nickname">({employee.nickname||"—"})</span></h2>
        <div className="contact-col">
          <h3 className="section-title">Телефон  <a href={`tel:${employee.phone||''}`} className="emp-phone">{employee.phone||"—"}</a>
          <div className="phone-line monospace">{phone}</div></h3>
          <h3 className="section-title">Имейл  <a href={`mailto:${email}`} className="emp-email">{email}</a></h3>
          {(address&&(address.street||address.zip||address.country))?<div className="addr-line">{[address.street,address.zip,address.country].filter(Boolean).join(', ')}</div>:null}
        </div>
        <div className="meta-line"><span className="meta-chip">{role}</span><span className="meta-chip">{department}</span></div>

        <div className="cert-list">{certificates && certificates.length>0 ? certificates.map((c,i)=>(<button key={i} className="cert-btn" onClick={()=>setShowCert(i)}>{c.name}</button>)):<span className="muted">Няма въведени сертификати.</span>}</div>

	<div className="ratings normal">
          <h3 className="section-title">Оценки</h3>
          <div className="score-row score-extended">
            
            <div className="criteria-col">
              {['skill','teamwork','communication','reliability','discipline'].map(key => {
                const v = Number((employee.ratings||{})[key] ?? (key==='discipline'?80:0))
                const lbl = ({skill:'Умение',teamwork:'Екипност',communication:'Комуникация',reliability:'Сигурност',discipline:'Дисциплина'})[key]
                return (<div className="crit-row" key={key}><span className="crit-label">{lbl}</span><div className="crit-bar"><div className="crit-fill" style={{width: Math.max(0,Math.min(100,v)) + '%'}}/></div><span className="crit-val">{isNaN(v)?'—':v}</span></div>)
              })}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="short-summary" style={{margin:"8px 0 4px 0"}}>
  <div className="muted" style={{fontSize:13}}>
    <strong>Кратка характеристика:</strong> {employee.role} · {employee.department} · {employee.hourlyRate} лв/ч
    {employee.eurRate ? ` · ${employee.eurRate.toFixed(2)} €/ч` : ''} · Сертификати: {(employee.certificates||[]).length}
  </div>
  <button className="btn xs" onClick={()=>setShowMore(v=>!v)}>{showMore ? "Виж по-малко" : "Виж повече"}</button>
  {showMore && (
    <div className="more-details" style={{marginTop:6,fontSize:13}}>
      <div>Оценки: дисциплина {employee.ratings?.discipline || 0}%, умения {employee.ratings?.skill || 0}%</div>
    </div>
  )}
</div>
    <div className="card-body">
      <TimesheetPanel employee={employee} dataset={timesheets} weekStartISO={weekStartISO} setWeekStartISO={setWeekStartISO} />
    </div>

    <AnimatePresence>
      {showPayslip&&(<PayslipPanel employee={employee} timesheets={timesheets} onClose={()=>setShowPayslip(false)}/>)}
      {showEdit&&(<EditPanel employee={employee} onClose={()=>setShowEdit(false)} onSave={handleSaveEdit}/>)}
      {showCert!=null&&(<CertificateViewer images={certificateImages||[]} startIndex={showCert} onClose={()=>setShowCert(null)}/>)}
    </AnimatePresence>
  </article>)
}
