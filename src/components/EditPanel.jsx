
import React, {useState} from 'react'
import { motion } from 'framer-motion'
export default function EditPanel({ employee, onClose, onSave }){
  const [photo,setPhoto]=useState(employee.photo||'')
  const [address,setAddress]=useState(employee.address||{street:'',city:'',zip:'',country:''})
  const [certImages,setCertImages]=useState(employee.certificateImages||[''])
  const handleChangeAddr=(k,v)=>setAddress(prev=>({...prev,[k]:v}))
  const setCertAt=(i,v)=>setCertImages(prev=>prev.map((x,idx)=>idx===i?v:x))
  const addCert=()=>setCertImages(prev=>[...prev,''])
  const removeCert=(i)=>setCertImages(prev=>prev.filter((_,idx)=>idx!==i))
  const save=()=>onSave({photo:photo.trim(),address,certificateImages:certImages.map(s=>s.trim()).filter(Boolean)})
  return (<div className="overlay"><motion.div className="edit-card" initial={{scale:.96,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.96,opacity:0}} transition={{duration:.2}}>
    <div className="pay-head"><h3>Редакция</h3><button className="btn" onClick={onClose}>✕</button></div>
    <div className="edit-grid">
      <label>Снимка (URL)<input type="url" value={photo} onChange={e=>setPhoto(e.target.value)} placeholder="https://..."/></label>
      <div className="addr-block"><div className="label">Адрес</div><div className="grid-2">
        <label>Улица<input value={address.street} onChange={e=>handleChangeAddr('street',e.target.value)}/></label>
        <label>Град<input value={address.city} onChange={e=>handleChangeAddr('city',e.target.value)}/></label>
        <label>Пощенски код<input value={address.zip} onChange={e=>handleChangeAddr('zip',e.target.value)}/></label>
        <label>Държава<input value={address.country} onChange={e=>handleChangeAddr('country',e.target.value)}/></label>
      </div></div>
      <div className="cert-imgs"><div className="label">Снимки на сертификати (URL-и)</div>
        {certImages.map((v,i)=>(<div className="row-cert" key={i}><input type="url" value={v} onChange={e=>setCertAt(i,e.target.value)} placeholder="https://..."/><button className="btn" onClick={()=>removeCert(i)}>–</button></div>))}
        <button className="btn ghost" onClick={addCert}>+ Добави</button>
      </div>
    </div>
    <div className="pay-actions"><button className="btn" onClick={save}>Запази</button><button className="btn ghost" onClick={onClose}>Отказ</button></div>
  </motion.div></div>)
}
