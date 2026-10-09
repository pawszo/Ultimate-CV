import React, { useState } from "react";
import { Experience } from "../types";
import { Briefcase, Plus, Trash2, Calendar, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export const ExperienceForm: React.FC<Props> = ({ data, onChange }) => {
  const { t, language } = useLanguage();
  const isEn = language === "en";
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [newExp, setNewExp] = useState<Omit<Experience, "id">>({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
    location: "",
  });

  const handleAdd = () => {
    if (!newExp.company || !newExp.role) {
      alert(isEn ? "Company name and position role are required." : "Nazwa firmy i stanowisko są wymagane.");
      return;
    }
    const created: Experience = {
      ...newExp,
      id: "exp-" + Date.now(),
    };
    onChange([...data, created]);
    setNewExp({
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      location: "",
    });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onChange(data.filter((e) => e.id !== id));
  };

  const handleItemChange = (id: string, field: keyof Experience, value: any) => {
    onChange(
      data.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "isCurrent" && value === true) {
            updated.endDate = "";
          }
          return updated;
        }
        return item;
      })
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 font-display">{t.expTitle}</h2>
            <p className="text-xs text-slate-400">{t.expSubtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t.addBtn}
        </button>
      </div>

      {/* Formularz dodawania nowego doświadczenia */}
      {isAdding && (
        <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.addExpBtn}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={t.expCompanyPlaceholder}
              value={newExp.company}
              onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            />
            <input
              type="text"
              placeholder={t.expRolePlaceholder}
              value={newExp.role}
              onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            />
            <input
              type="month"
              placeholder={t.expStartDateLabel}
              value={newExp.startDate}
              onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            />
            <div className="flex items-center gap-2">
              <input
                type="month"
                placeholder={t.expEndDateLabel}
                value={newExp.endDate}
                disabled={newExp.isCurrent}
                onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white disabled:bg-slate-100 disabled:text-slate-400"
              />
              <label className="flex items-center gap-1 text-[11px] text-slate-500 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={newExp.isCurrent}
                  onChange={(e) => setNewExp({ ...newExp, isCurrent: e.target.checked, endDate: e.target.checked ? "" : "" })}
                />
                {t.present}
              </label>
            </div>
            <input
              type="text"
              placeholder={t.expLocationPlaceholder}
              value={newExp.location}
              onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white md:col-span-2"
            />
            <textarea
              placeholder={t.expDescPlaceholder}
              rows={3}
              value={newExp.description}
              onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white md:col-span-2 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              {t.addBtn}
            </button>
          </div>
        </div>
      )}

      {/* Lista doświadczeń */}
      <div className="space-y-3">
        {data.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">{t.expEmpty}</p>
        ) : (
          data.map((exp) => (
            <div key={exp.id} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/20">
              {/* Header elementu listy */}
              <div
                onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg mt-0.5">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">{exp.role}</h3>
                    <p className="text-xs text-slate-500 font-medium">{exp.company} {exp.location ? `• ${exp.location}` : ""}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> {exp.startDate} – {exp.isCurrent ? t.present : exp.endDate || "–"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50/50 transition-colors cursor-pointer"
                    title={t.deleteTooltip}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {expandedId === exp.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Formularz edycji rozwijany */}
              {expandedId === exp.id && (
                <div className="px-4 pb-4 border-t border-slate-100 bg-white/80 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t.expCompanyLabel}</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleItemChange(exp.id, "company", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t.expRoleLabel}</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleItemChange(exp.id, "role", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t.expStartDateLabel}</label>
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => handleItemChange(exp.id, "startDate", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t.expEndDateLabel}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="month"
                          value={exp.endDate}
                          disabled={exp.isCurrent}
                          onChange={(e) => handleItemChange(exp.id, "endDate", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                        />
                        <label className="flex items-center gap-1 text-[11px] text-slate-500 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={exp.isCurrent}
                            onChange={(e) => handleItemChange(exp.id, "isCurrent", e.target.checked)}
                          />
                          {t.present}
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t.expLocationLabel}</label>
                      <input
                        type="text"
                        value={exp.location || ""}
                        onChange={(e) => handleItemChange(exp.id, "location", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t.expDescLabel}</label>
                      <textarea
                        rows={3}
                        value={exp.description}
                        onChange={(e) => handleItemChange(exp.id, "description", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
