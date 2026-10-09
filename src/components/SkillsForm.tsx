import React, { useState } from "react";
import { Skill } from "../types";
import { Star, Plus, Trash2, Award } from "lucide-react";

interface Props {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

const CATEGORIES = [
  "Umiejętności techniczne",
  "Umiejętności miękkie",
  "Narzędzia i oprogramowanie",
  "Języki obce",
  "Inne",
];

const PROFICIENCIES: Array<Skill["proficiency"]> = ["Podstawowy", "Średni", "Zaawansowany", "Ekspert"];

export const SkillsForm: React.FC<Props> = ({ data, onChange }) => {
  const [newSkill, setNewSkill] = useState<{
    name: string;
    category: string;
    proficiency: Skill["proficiency"];
  }>({
    name: "",
    category: "Umiejętności techniczne",
    proficiency: "Średni",
  });

  const handleAdd = () => {
    if (!newSkill.name.trim()) {
      alert("Nazwa umiejętności jest wymagana.");
      return;
    }
    const created: Skill = {
      id: "sk-" + Date.now(),
      name: newSkill.name.trim(),
      category: newSkill.category,
      proficiency: newSkill.proficiency,
    };
    onChange([...data, created]);
    setNewSkill({
      ...newSkill,
      name: "",
    });
  };

  const handleDelete = (id: string) => {
    onChange(data.filter((s) => s.id !== id));
  };

  const getBadgeColor = (prof: Skill["proficiency"]) => {
    switch (prof) {
      case "Ekspert":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "Zaawansowany":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Średni":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Podstawowy":
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 font-display">Umiejętności</h2>
            <p className="text-xs text-slate-400">Twoje kluczowe kompetencje twarde i miękkie</p>
          </div>
        </div>
      </div>

      {/* Panel szybkiego dodawania umiejętności */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Nazwa umiejętności</label>
          <input
            type="text"
            placeholder="np. SQL, Zarządzanie zespołem, Figma"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Kategoria</label>
          <select
            value={newSkill.category}
            onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Poziom</label>
          <div className="flex gap-1.5">
            <select
              value={newSkill.proficiency}
              onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value as Skill["proficiency"] })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              {PROFICIENCIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              className="px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grupy umiejętności */}
      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const filtered = data.filter((s) => s.category === cat);
          if (filtered.length === 0) return null;

          return (
            <div key={cat} className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat}</h3>
              <div className="flex flex-wrap gap-2">
                {filtered.map((skill) => (
                  <div
                    key={skill.id}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white shadow-xs hover:border-slate-300 transition-all text-xs"
                  >
                    <span className="font-medium text-slate-700">{skill.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getBadgeColor(skill.proficiency)}`}>
                      {skill.proficiency}
                    </span>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors focus:outline-none"
                      title="Usuń"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-6">Brak umiejętności w profilu. Dodaj kilka u góry.</p>
        )}
      </div>
    </div>
  );
};
