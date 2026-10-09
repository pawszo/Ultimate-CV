import React from "react";
import { useLanguage } from "../i18n/LanguageContext";

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className={`inline-flex items-center bg-slate-100/90 hover:bg-slate-100 border border-slate-200/90 rounded-lg p-0.5 text-xs transition-colors ${className}`}
      title={t.switchLanguage}
      role="group"
      aria-label={t.switchLanguage}
    >
      <button
        type="button"
        onClick={() => setLanguage("pl")}
        className={`px-2 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer text-[11px] ${
          language === "pl"
            ? "bg-white text-slate-900 shadow-2xs border border-slate-200/50"
            : "text-slate-500 hover:text-slate-800"
        }`}
        aria-pressed={language === "pl"}
      >
        <span>🇵🇱</span>
        <span>PL</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer text-[11px] ${
          language === "en"
            ? "bg-white text-slate-900 shadow-2xs border border-slate-200/50"
            : "text-slate-500 hover:text-slate-800"
        }`}
        aria-pressed={language === "en"}
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
};
