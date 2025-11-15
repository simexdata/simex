
import React from 'react'
import { motion } from 'framer-motion'
export default function CertificateViewer({ images=[], startIndex=0, onClose, onUpload, onSave, dirty=false }) {
  const [idx, setIdx] = React.useState(startIndex || 0)
  const [localImgs,setLocalImgs]=React.useState(images||[])
  const has = localImgs && localImgs.length > 0
  const fileRef = React.useRef(null)
  const pickFile=()=>fileRef.current && fileRef.current.click()
  const onFile=(e)=>{const f=e.target.files && e.target.files[0]; if(!f) return; const url=URL.createObjectURL(f); setLocalImgs(prev=>{const copy=[...prev]; copy[idx]=url; return copy})}
  const prev = () => setIdx(i => (i - 1 + localImgs.length) % localImgs.length)
  const next = () => setIdx(i => (i + 1) % localImgs.length)
  return (<div className="overlay"><motion.div className="pay-card" initial={{ scale: .96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .96, opacity: 0 }} transition={{ duration: .2 }}>
    <div className="pay-head"><h3>Сертификат</h3><button className="btn" onClick={onClose}>✕</button></div>
    <div style={{display:'grid',placeItems:'center',gap:10}}>{has?(
      <div style={{display:'grid',gap:8,justifyItems:'center'}}><div style={{display:'flex',gap:8,alignItems:'center'}}><button className="btn" onClick={prev}>←</button><img src={localImgs[idx]} alt={`Сертификат ${idx+1}`} style={{maxWidth:'78vw',maxHeight:'62vh',border:'1px solid var(--border)',borderRadius:12}}/><button className="btn" onClick={next}>→</button></div><div className="pay-actions"><input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={onFile}/><button className="btn" onClick={pickFile}>Добави/промени</button><button className="btn ghost" onClick={()=>onSave && onSave(localImgs)}>Запази</button></div></div>
    ):<div className="muted">Няма снимки на сертификати.</div>}</div>
  </motion.div></div>) }
