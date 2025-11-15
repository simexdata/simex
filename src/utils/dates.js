
export function toISODate(d){const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
export function parseISODate(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
export function startOfWeek(date){const d=new Date(date);const day=d.getDay()||7;if(day!==1)d.setDate(d.getDate()-(day-1));d.setHours(0,0,0,0);return d}
export function endOfWeek(date){const start=startOfWeek(date);const end=new Date(start);end.setDate(start.getDate()+6);end.setHours(23,59,59,999);return end}
export function addDays(date,days){const d=new Date(date);d.setDate(d.getDate()+days);return d}
export function addWeeks(date,weeks){return addDays(date,weeks*7)}
export function formatBGFull(date){const dd=String(date.getDate()).padStart(2,'0');const mm=String(date.getMonth()+1).padStart(2,'0');const yyyy=String(date.getFullYear());return `${dd}.${mm}.${yyyy} г.`}
export function isoWeek(date){const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));const dayNum=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()+4-dayNum);const yearStart=new Date(Date.UTC(d.getUTCFullYear(),0,1));return Math.ceil((((d-yearStart)/86400000)+1)/7)}
