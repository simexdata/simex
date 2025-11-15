
import React, {useMemo, useState} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import EmployeeList from './components/EmployeeList.jsx'
import EmployeeCard from './components/EmployeeCard.jsx'
import employeesSeed from './data/employees.json'
import company from './data/company.json'
import { exportEmployeesToXLSX } from './utils/export.js'
function mergeOverrides(seed){try{const raw=localStorage.getItem('employeesOverrides');if(!raw)return seed;const ov=JSON.parse(raw);return seed.map(e=>({...e,...(ov[e.id]||{})}))}catch{return seed}}
export default function App(){
  const [showDirectory, setShowDirectory] = React.useState(false);
  const [userRole, setUserRole] = React.useState('admin');
  const [currentUserId, setCurrentUserId] = React.useState('e001');
  const [employees,setEmployees]=useState(()=>mergeOverrides(employeesSeed))
  const [query,setQuery]=useState(''); const [dept,setDept]=useState('Всички'); const [role,setRole]=useState('Всички'); const [selectedId,setSelectedId]=useState(null)
  const deptOptions=useMemo(()=>['Всички',...Array.from(new Set(employees.map(e=>e.department))).sort()], [employees])
  const roleOptions=useMemo(()=>['Всички',...Array.from(new Set(employees.map(e=>e.role))).sort()], [employees])
  const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return employees.filter(e=>{const matchQ=!q||(e.name+' '+e.email+' '+e.role+' '+e.department).toLowerCase().includes(q);const matchDept=dept==='Всички'||e.department===dept;const matchRole=role==='Всички'||e.role===role;return matchQ&&matchDept&&matchRole})},[employees,query,dept,role])
  const selected=useMemo(()=>filtered.find(e=>String(e.id)===String(selectedId))||employees.find(e=>String(e.id)===String(selectedId))||null,[filtered,employees,selectedId])
  const updateEmployee=(id,patch)=>{setEmployees(prev=>{const next=prev.map(e=>e.id===id?{...e,...patch}:e);try{const raw=localStorage.getItem('employeesOverrides');const ov=raw?JSON.parse(raw):{};ov[id]={...(ov[id]||{}),...patch};localStorage.setItem('employeesOverrides',JSON.stringify(ov))}catch{}return next})}
  return (<div className="app-shell">
    <header className="app-header"><div className="title-row"><div className="brand">{company.logoDataUrl ? <img alt="Лого" src={company.logoDataUrl} className="brand-logo" /> : <div className="brand-logo-fallback">LOGO</div>}<h1 className="title muted-small">Картотека</h1></div></div><div className="actions-row">{selected && (<></>)}<button onClick={()=>exportEmployeesToXLSX(filtered)} className="btn ghost">Експорт в Excel</button></div></header>
    <div className="content-grid">
      <section className="list-pane"><EmployeeList employees={filtered} selectedId={selected?.id||null} onSelect={id=>setSelectedId(id)} query={query} setQuery={setQuery} dept={dept} setDept={setDept} role={role} setRole={setRole} deptOptions={deptOptions} roleOptions={roleOptions}/></section>
      <section className="detail-pane"><AnimatePresence mode="wait">{selected?(<motion.div key={selected.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.24,ease:'easeOut'}} className="detail-wrap"><EmployeeCard employee={selected} onUpdate={updateEmployee}/></motion.div>):(<motion.div key="placeholder" className="placeholder" initial={{opacity:0}} animate={{opacity:.6}} exit={{opacity:0}}>Избери служител от списъка.</motion.div>)}</AnimatePresence></section>
    </div>
    <footer className="app-footer"><span className="footer-logo">SD</span><span>Simex Data Ltd · All rights reserved.</span></footer>
  </div>)
}
