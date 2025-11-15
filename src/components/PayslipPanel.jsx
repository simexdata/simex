
import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import company from '../data/company.json'
import { toISODate } from '../utils/dates.js'
import { calcPayslip } from '../utils/payroll.js'
import { exportPayslipToXLSX, exportPayslipToPDF } from '../utils/export.js'
export default function PayslipPanel({ employee, timesheets, onClose }){
  const today=new Date(); const defaultStart=new Date(today.getFullYear(),today.getMonth(),1); const defaultEnd=new Date(today.getFullYear(),today.getMonth()+1,0)
  const [startISO,setStartISO]=useState(toISODate(defaultStart)); const [endISO,setEndISO]=useState(toISODate(defaultEnd))
  const [extraExpenses,setExtraExpenses]=useState(0); const [extraDeductions,setExtraDeductions]=useState(0)
  const payslip=useMemo(()=>calcPayslip(timesheets,employee,startISO,endISO),[timesheets,employee,startISO,endISO])
  const finalNet=useMemo(()=> (payslip.net + Number(extraExpenses||0) - Number(extraDeductions||0)), [payslip,extraExpenses,extraDeductions])
  const handleExportXLSX=()=>exportPayslipToXLSX({...payslip,extraExpenses,extraDeductions,finalNet}); const handleExportPDF=()=>exportPayslipToPDF({...payslip,extraExpenses,extraDeductions,finalNet},{company})
  const openEmailDraft=()=>{const subject=encodeURIComponent(`Payslip ${employee.name} — ${startISO} → ${endISO}`);const body=encodeURIComponent(`Здравей, ${employee.name},\n\nПрикачвам пейслипа за периода ${startISO} → ${endISO}.\n\нДължимо: ${finalNet.toFixed(2)}\n\nПоздрави,\n${company.name}`);window.location.href=`mailto:${employee.email}?subject=${subject}&body=${body}`}
  return (<div className="overlay"><motion.div className="pay-card invoice" initial={{scale:.96,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.96,opacity:0}} transition={{duration:.2}}>
    <div className="pay-head"><div className="invoice-brand"><div className="logo-fallback">LOGO</div><div className="brand-meta"><div className="brand-name">{company.name}</div>{company.address?<div className="brand-sub">{company.address}</div>:null}</div></div><button className="btn" onClick={onClose}>✕</button></div>
    <div className="invoice-top"><div className="inv-left"><div className="label">До</div><div className="val">{employee.name} &lt;{employee.email}&gt;</div></div><div className="inv-right"><div className="label">Период</div><div className="val">{startISO} → {endISO}</div></div></div>
    <div className="invoice-table"><div className="inv-head"><div>Описание</div><div>Кол-во</div><div>Ставка</div><div>Сума</div></div><div className="inv-body">
      <div className="inv-row"><div>Отработени часове</div><div>{payslip.hours}</div><div>{payslip.rate.toFixed(2)}</div><div>{payslip.gross.toFixed(2)}</div></div>
      <div className="inv-row"><div>Данъци</div><div>—</div><div>—</div><div>-{payslip.taxes.toFixed(2)}</div></div>
      <div className="inv-row"><div>Осигуровки</div><div>—</div><div>—</div><div>-{payslip.insurance.toFixed(2)}</div></div>
      <div className="inv-row"><div>Разходи (възстановими)</div><div>—</div><div>—</div><div>{Number(extraExpenses||0).toFixed(2)}</div></div>
      <div className="inv-row"><div>Удръжки</div><div>—</div><div>—</div><div>-{Number(extraDeductions||0).toFixed(2)}</div></div>
    </div><div className="inv-foot"><div className="label strong">Дължимо</div><div className="val strong">{finalNet.toFixed(2)}</div></div></div>
    <div className="pay-controls grid"><label>Разходи: <input type="number" step="0.01" value={extraExpenses} onChange={e=>setExtraExpenses(e.target.value)}/></label><label>Удръжки: <input type="number" step="0.01" value={extraDeductions} onChange={e=>setExtraDeductions(e.target.value)}/></label></div>
    <div className="pay-actions"><button className="btn" onClick={handleExportPDF}>PDF</button><button className="btn ghost" onClick={handleExportXLSX}>Excel</button><button className="btn" onClick={openEmailDraft}>Email чернова</button></div>
  </motion.div></div>)
}
