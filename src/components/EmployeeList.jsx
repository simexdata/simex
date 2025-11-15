
import React from 'react'
import { motion } from 'framer-motion'
export default function EmployeeList({ employees, selectedId, onSelect, query, setQuery, dept, setDept, role, setRole, deptOptions, roleOptions }){
  return (<div className="list-root">
    <div className="filters">
      <input className="input" placeholder="Търсене по име, имейл, роля..." value={query} onChange={e=>setQuery(e.target.value)} />
      <div className="selects">
        <select className="select" value={dept} onChange={e=>setDept(e.target.value)}>{deptOptions.map(x=><option key={x} value={x}>{x}</option>)}</select>
        <select className="select" value={role} onChange={e=>setRole(e.target.value)}>{roleOptions.map(x=><option key={x} value={x}>{x}</option>)}</select>
      </div>
    </div>
    <div className="table">
      <div className="thead"><div>Име</div><div>Роля</div><div>Отдел</div><div>Телефон</div></div>
      <div className="tbody">{employees.map((e,i)=>(
        <motion.button key={e.id} onClick={()=>onSelect(e.id)} className={`row ${selectedId===e.id?'selected':''}`} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:.18,delay:i*.015}} whileHover={{y:-1}} whileTap={{scale:.995}}>
          <div className="cell strong name-cell"><span className="name">{e.name}</span> <span className="nickname">({e.nickname||'—'})</span> · <span className="dept">{e.department}</span>, <span className="role">{e.role}</span></div>
          <div className="cell">{e.role}</div><div className="cell">{e.department}</div><div className="cell monospace">{e.phone}</div><div className="cell monospace">{e.email}</div>
        </motion.button>
      ))}{employees.length===0&&<div className="empty">Няма резултати.</div>}</div>
    </div>
  </div>)
}
