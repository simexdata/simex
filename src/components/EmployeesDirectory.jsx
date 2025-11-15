import React from "react";
import { useTranslation } from "react-i18next";
import ImportExportBar from "./ImportExportBar.jsx";
import dataEmployees from "@/data/employees.json";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function normalizeEmail(s){ return (s||'').trim().toLowerCase(); }
function normalizePhone(s){
  const raw = (s||'').replace(/\D/g,'');
  if(raw.startsWith('0') && raw.length===10) return '+359' + raw.slice(1);
  if(raw.startsWith('359')) return '+'+raw;
  if(s?.startsWith('+')) return s;
  return s||'';
}

function uniqBy(arr, keyFn){
  const seen = new Set(); const out=[];
  for(const x of arr){ const k = keyFn(x); if(!k || seen.has(k)) continue; seen.add(k); out.push(x); }
  return out;
}

export default function EmployeesDirectory({ open, onClose, role='admin', currentUserId=null }){
  const { t, i18n } = useTranslation();
  const [rows, setRows] = React.useState(()=> dataEmployees || []);
  const [query, setQuery] = React.useState("");
  const [dept, setDept] = React.useState("all");
  const [roleF, setRoleF] = React.useState("all");
  const [editing, setEditing] = React.useState(null);
  const [errors, setErrors] = React.useState({});

  const canEdit = role === 'admin';
  const baseRows = React.useMemo(()=> (role==='admin' ? rows : rows.filter(r => r.id===currentUserId)), [rows, role, currentUserId]);

  const depts = React.useMemo(()=> {
    const s = new Set(baseRows.map(r=>r.department).filter(Boolean)); return ["all", ...Array.from(s)];
  }, [baseRows]);
  const roles = React.useMemo(()=> {
    const s = new Set(baseRows.map(r=>r.role).filter(Boolean)); return ["all", ...Array.from(s)];
  }, [baseRows]);

  const filtered = baseRows.filter(r => {
    const q = query.toLowerCase().trim();
    const matchesQ = !q || [r.name, r.email, r.role, r.department, r.phone].some(v => (v||"").toLowerCase().includes(q));
    const matchesDept = (dept==="all") || r.department===dept;
    const matchesRole = (roleF==="all") || r.role===roleF;
    return matchesQ && matchesDept && matchesRole;
  });

  const columns = i18n.language==='bg'
    ? [
        { key:"id", header:"Идентификатор" },
        { key:"name", header:"Име" },
        { key:"role", header:"Роля" },
        { key:"department", header:"Отдел" },
        { key:"email", header:"Имейл" },
        { key:"phone", header:"Телефон" },
        { key:"rate", header:"СтавкаНаЧас" },
      ]
    : [
        { key:"id", header:"EmployeeID" },
        { key:"name", header:"Name" },
        { key:"role", header:"Role" },
        { key:"department", header:"Department" },
        { key:"email", header:"Email" },
        { key:"phone", header:"Phone" },
        { key:"rate", header:"RatePerHour" },
      ];

  const handleImport = (list) => {
    if(!canEdit) return;
    const mapped = list.map(x => ({
      id: (x.id || x.EmployeeID || x.Идентификатор || "").toString().trim(),
      name: (x.name || x.Name || x.Име || "").toString().trim(),
      role: (x.role || x.Role || x.Роля || "").toString().trim(),
      department: (x.department || x.Department || x.Отдел || "").toString().trim(),
      email: normalizeEmail(x.email || x.Email || x.Имейл || ""),
      phone: normalizePhone(x.phone || x.Phone || x.Телефон || ""),
      rate: Number(x.rate || x.RatePerHour || x.СтавкаНаЧас || 0),
    }));
    const merged = uniqBy([...mapped, ...rows], r=> (r.id || r.email));
    setRows(merged);
  };

  function validate(e){
    const errs = {};
    if(!e.id?.trim()) errs.id = t('validation_id_required');
    const idTaken = rows.some(r => r.id===e.id && r !== rows.find(x=>x.id===e.id) && r.id!==editing?.__origId);
    if(idTaken) errs.id = t('validation_id_taken');
    if(!e.email?.trim()) errs.email = t('validation_email_required');
    else if(!emailRe.test(e.email)) errs.email = t('validation_email_invalid');
    const emailTaken = rows.some(r => r.email===e.email && r.id!==editing?.__origId);
    if(emailTaken) errs.email = t('validation_email_taken');
    return errs;
  }

  function startEdit(r){
    if(!canEdit) return;
    setEditing({ ...r, __origId: r.id });
    setErrors({});
  }
  function startAdd(){
    if(!canEdit) return;
    const tmp = { id: "e"+Math.random().toString(36).slice(2,7), name:"", role:"", department:"", email:"", phone:"", rate:0, __origId:null };
    setEditing(tmp); setErrors({});
  }
  function cancelEdit(){ setEditing(null); setErrors({}); }
  function saveEdit(){
    const normalized = { ...editing, email: normalizeEmail(editing.email), phone: normalizePhone(editing.phone), id: (editing.id||'').trim() };
    const v = validate(normalized); setErrors(v);
    if(Object.keys(v).length) return;
    setRows(rs => {
      const exists = rs.some(x => x.id===editing.__origId || x.id===normalized.id);
      if(exists){
        return rs.map(x => (x.id===editing.__origId) ? { ...normalized } : x);
      }
      return [{ ...normalized }, ...rs];
    });
    setEditing(null);
  }
  function removeRow(id){ if(!canEdit) return; setRows(rs => rs.filter(x => x.id !== id)); }

  if(!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-4 lg:inset-10 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" onClick={(e)=>e.stopPropagation()}>
        <header className="px-4 py-3 border-b bg-white flex items-center gap-2">
          <div className="text-lg font-semibold">{t("directory")}</div>
          <div className="ml-auto flex items-center gap-2">
            {canEdit && (
              <ImportExportBar
                data={rows}
                onImport={handleImport}
                pdfTargetSelector="#employeesTable"
                fileBaseName="Simex_Employees"
                columns={columns}
              />
            )}
            {canEdit && <button className="btn" onClick={startAdd}>{t("add_employee")}</button>}
            <button className="btn" onClick={onClose}>✕</button>
          </div>
        </header>

        <div className="p-4 flex items-center gap-2 border-b bg-white">
          <input className="input" placeholder={t("search_employees")} value={query} onChange={(e)=>setQuery(e.target.value)} style={{minWidth:260}}/>
          <select className="select" value={dept} onChange={(e)=>setDept(e.target.value)}>
            {depts.map(d => <option key={d} value={d}>{d==='all' ? t('all') : d}</option>)}
          </select>
          <select className="select" value={roleF} onChange={(e)=>setRoleF(e.target.value)}>
            {roles.map(r => <option key={r} value={r}>{r==='all' ? t('all') : r}</option>)}
          </select>
        </div>

        <div className="p-4 overflow-auto">
          <div id="employeesTable" className="w-full">
            <table className="w-full text-sm border-collapse">
              <thead className="text-gray-500 sticky top-0 bg-white">
                <tr>
                  <th className="text-left py-2 px-2">{i18n.language==='bg'?'Служител':'Employee'}</th>
                  <th className="text-left py-2 px-2">{t("role")}</th>
                  <th className="text-left py-2 px-2">{t("department")}</th>
                  <th className="text-left py-2 px-2">{t("email")}</th>
                  <th className="text-left py-2 px-2">{t("phone")}</th>
                  <th className="text-right py-2 px-2">{t("rate_per_hour")}</th>
                  <th className="text-right py-2 px-2">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 && (
                  <tr><td className="py-8 text-center text-gray-500" colSpan={7}>{t("no_results")}</td></tr>
                )}
                {filtered.map(r => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-gray-200 grid place-items-center">👤</div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{r.name}</div>
                          <div className="text-xs text-gray-500 truncate">#{r.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-2">{r.role}</td>
                    <td className="py-2 px-2">{r.department}</td>
                    <td className="py-2 px-2 truncate max-w-[240px]">{r.email}</td>
                    <td className="py-2 px-2">{r.phone}</td>
                    <td className="py-2 px-2 text-right">{Number(r.rate||0).toFixed(2)}</td>
                    <td className="py-2 px-2 text-right">
                      {canEdit ? (
                        <>
                          <button className="btn" onClick={()=>startEdit(r)}>{t("edit")}</button>
                          <button className="btn" onClick={()=>removeRow(r.id)} style={{marginLeft:8}}>{t("delete")}</button>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editing && (
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l shadow-xl p-4 grid gap-3">
            <div className="text-lg font-semibold">{editing?.__origId ? t("edit") : t("add_employee")}</div>
            <label className="grid text-sm gap-1">ID
              <input className="input" value={editing.id} onChange={(e)=> setEditing({...editing, id:e.target.value})}/>
              {errors.id && <span className="text-red-600 text-xs">{errors.id}</span>}
            </label>
            <label className="grid text-sm gap-1">{i18n.language==='bg'?'Име':'Name'}
              <input className="input" value={editing.name} onChange={(e)=> setEditing({...editing, name:e.target.value})}/>
            </label>
            <label className="grid text-sm gap-1">{t("role")}
              <input className="input" value={editing.role} onChange={(e)=> setEditing({...editing, role:e.target.value})}/>
            </label>
            <label className="grid text-sm gap-1">{t("department")}
              <input className="input" value={editing.department} onChange={(e)=> setEditing({...editing, department:e.target.value})}/>
            </label>
            <label className="grid text-sm gap-1">{t("email")}
              <input className="input" value={editing.email} onChange={(e)=> setEditing({...editing, email:e.target.value})}/>
              {errors.email && <span className="text-red-600 text-xs">{errors.email}</span>}
            </label>
            <label className="grid text-sm gap-1">{t("phone")}
              <input className="input" value={editing.phone} onChange={(e)=> setEditing({...editing, phone:e.target.value})}/>
            </label>
            <label className="grid text-sm gap-1">{t("rate_per_hour")}
              <input type="number" step="0.01" className="input" value={editing.rate} onChange={(e)=> setEditing({...editing, rate: Number(e.target.value)})}/>
            </label>
            <div className="flex items-center gap-2 mt-2">
              <button className="btn" onClick={saveEdit} disabled={Object.keys(errors).length>0}>{t("save")}</button>
              <button className="btn" onClick={cancelEdit}>{t("cancel")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}