import React, { useState } from "react";
import { Language } from "../types";
import { Languages, Plus, Trash2, Globe2, Edit2, Check } from "lucide-react";

interface Props {
  data: Language[];
  onChange: (data: Language[]) => void;
}

const COMMON_LEVEL_OPTIONS = [
  "A1 - Początkujący",
  "A2 - Podstawowy",
  "B1 - Średniozaawansowany",
  "B2 - Wyższy średniozaawansowany",
  "C1 - Zaawansowany / Płynny",
  "C2 - Biegły",
  "Ojczysty (Native)",
  "Komunikatywny",
  "Biznesowy / Techniczny",
  "Własny opis..."
];

const PRESET_LANG_NAMES = [
  { name: "Język angielski", flag: "🇬🇧" },
  { name: "Język niemiecki", flag: "🇩🇪" },
  { name: "Język hiszpański", flag: "🇪🇸" },
  { name: "Język francuski", flag: "🇫🇷" },
  { name: "Język włoski", flag: "🇮🇹" },
  { name: "Język polski", flag: "🇵🇱" },
];

export const LanguagesForm: React.FC<Props> = ({ data = [], onChange }) => {
  const [langName, setLangName] = useState("");
  const [selectedLevelOption, setSelectedLevelOption] = useState("B2 - Wyższy średniozaawansowany");
  const [customLevelText, setCustomLevelText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLevelText, setEditLevelText] = useState("");

  const effectiveLevel = selectedLevelOption === "Własny opis..." 
    ? (customLevelText.trim() || "Średniozaawansowany")
    : selectedLevelOption;

  const handleAdd = () => {
    if (!langName.trim()) return;

    const created: Language = {
      id: "lang-" + Date.now(),
      name: langName.trim(),
      level: effectiveLevel,
    };

    onChange([...data, created]);
    setLangName("");
    setCustomLevelText("");
  };

  const handlePresetClick = (presetName: string) => {
    setLangName(presetName);
  };

  const handleDelete = (id: string) => {
    onChange(data.filter((l) => l.id !== id));
  };

  const startEdit = (lang: Language) => {
    setEditingId(lang.id);
    setEditLevelText(lang.level);
  };

  const saveEdit = (id: string) => {
    if (!editLevelText.trim()) return;
    onChange(
      data.map((l) => (l.id === id ? { ...l, level: editLevelText.trim() } : l))
    );
    setEditingId(null);
  };

  const getBadgeColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes("c1") || l.includes("c2") || l.includes("ojczysty") || l.includes("biegły") || l.includes("płynny")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (l.includes("b1") || l.includes("b2") || l.includes("biznesowy") || l.includes("średnio")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 font-display">Języki Obce</h2>
            <p className="text-xs text-slate-400">Podaj języki i samodzielnie określ swój poziom znajomości</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-100">
          {data.length} {data.length === 1 ? "język" : data.length > 1 && data.length < 5 ? "języki" : "języków"}
        </span>
      </div>

      {/* Szybki wybór nazwy języka do pola wprowadzania */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Kliknij, aby uzupełnić nazwę języka:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_LANG_NAMES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handlePresetClick(preset.name)}
              className="px-2.5 py-1 text-xs rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-200"
            >
              <span>{preset.flag}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Formularz wprowadzania z pełną kontrolą użytkownika nad poziomem */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end bg-slate-50/70 p-3.5 rounded-xl border border-slate-150">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Język</label>
          <input
            type="text"
            placeholder="np. Język angielski"
            value={langName}
            onChange={(e) => setLangName(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Twój poziom znajomości</label>
          {selectedLevelOption === "Własny opis..." ? (
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Wpisz własny poziom (np. B2+, Komunikatywny)"
                value={customLevelText}
                onChange={(e) => setCustomLevelText(e.target.value)}
                autoFocus
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setSelectedLevelOption("B2 - Wyższy średniozaawansowany")}
                className="px-2 text-[10px] text-slate-500 hover:text-slate-800 border border-slate-200 bg-white rounded-lg cursor-pointer"
                title="Wróć do listy wyboru"
              >
                Lista
              </button>
            </div>
          ) : (
            <select
              value={selectedLevelOption}
              onChange={(e) => setSelectedLevelOption(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              {COMMON_LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!langName.trim()}
          className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Dodaj</span>
        </button>
      </div>

      {/* Lista dodanych języków z możliwością edycji poziomu */}
      {data.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
          <Globe2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Brak dodanych języków obcych.</p>
          <p className="text-[11px] text-slate-300 mt-0.5">Wpisz język i wybierz swój rzeczywisty poziom znajomości.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((lang) => (
            <div
              key={lang.id}
              className="flex items-center justify-between p-3 bg-white border border-slate-200/80 rounded-xl hover:border-indigo-200 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">{lang.name}</span>
                  
                  {editingId === lang.id ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        value={editLevelText}
                        onChange={(e) => setEditLevelText(e.target.value)}
                        placeholder="Poziom języka..."
                        className="text-xs px-2 py-0.5 border border-indigo-300 rounded bg-white text-slate-800 w-44"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(lang.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(lang.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                        title="Zapisz"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${getBadgeColor(lang.level)}`}>
                      {lang.level}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                {editingId !== lang.id && (
                  <button
                    type="button"
                    onClick={() => startEdit(lang)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Zmień poziom"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(lang.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Usuń język"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
