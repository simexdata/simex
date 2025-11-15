import { useLang } from "../contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <button onClick={() => setLang("en")} style={{ fontWeight: lang === "en" ? "bold" : "normal" }}>
        EN
      </button>
      <button onClick={() => setLang("bg")} style={{ fontWeight: lang === "bg" ? "bold" : "normal" }}>
        BG
      </button>
    </div>
  );
}
