import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useTranslation } from "react-i18next";

export default function ImportExportBar({ data=[], onImport=()=>{}, pdfTargetSelector, columns=[], fileBaseName="Employees" }){
  const { t } = useTranslation();
  const handleImport = async (file) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const mapped = json.map(row => {
      const obj = {};
      columns.forEach(col => obj[col.key] = row[col.header]);
      return obj;
    });
    onImport(mapped);
  };
  const exportExcel = () => {
    const rows = data.map(row => {
      const out = {};
      columns.forEach(c => out[c.header] = row[c.key]);
      return out;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileBaseName}.xlsx`);
  };
  const exportPDF = async () => {
    const el = document.querySelector(pdfTargetSelector);
    if(!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
    const w = canvas.width * ratio, h = canvas.height * ratio;
    const x = (pageW - w) / 2, y = (pageH - h) / 2;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, w, h);
    pdf.save(`${fileBaseName}.pdf`);
  };
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label className="btn">
        {t("import_excel")}
        <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e)=> e.target.files && handleImport(e.target.files[0])} />
      </label>
      <button className="btn" onClick={exportExcel}>{t("export_excel")}</button>
      <button className="btn" onClick={exportPDF}>{t("export_pdf")}</button>
    </div>
  )
}