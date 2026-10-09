import React, { useState } from "react";
import { Education } from "../types";
import { GraduationCap, Plus, Trash2, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export const EducationForm: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [newEdu, setNewEdu] = useState<Omit<Education, "id">>({
    school: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleAdd = () => {
    if (!newEdu.school || !newEdu.fieldOfStudy) {
      alert(t.schoolAndFieldRequired);
      return;
    }
    const created: Education = {
      ...newEdu,
      id: "edu-" + Date.now(),
    };
    onChange([...data, created]);
    setNewEdu({
      school: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onChange(data.filter((e) => e.id !== id));
  };

  const handleItemChange = (id: string, field: keyof Education, value: any) => {
    onChange(
      data.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 font-display">{t.eduTitle}</h2>
            <p className="text-xs text-slate-400">{t.eduSubtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t.addEduBtn}
        </button>
      </div>

      {/* Formularz dodawania nowej edukacji */}
      {isAdding && (
        <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.addNewSchool}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={t.eduSchoolPlaceholder}
              value={newEdu.school}
              onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            />
            <input
              type="text"
              placeholder={t.eduFieldPlaceholder}
              value={newEdu.fieldOfStudy}
              onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            />
            <input
              type="text"
              placeholder={t.eduDegreePlaceholder}
              value={newEdu.degree}
              onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="month"
                placeholder={t.eduStartDatePlaceholder}
                value={newEdu.startDate}
                onChange={(e) => setNewEdu({ ...newEdu, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
              />
              <input
                type="month"
                placeholder={t.eduEndDatePlaceholder}
                value={newEdu.endDate}
                onChange={(e) => setNewEdu({ ...newEdu, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <textarea
              placeholder={t.eduDescPlaceholder}
              rows={3}
              value={newEdu.description}
              onChange={(e) => setNewEdu({ ...newEdu, description: e.target.value })}
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
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 cursor-pointer"
            >
              {t.save}
            </button>
          </div>
        </div>
      )}

      {/* Lista edukacji */}
      <div className="space-y-3">
        {data.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">{t.eduEmpty}</p>
        ) : (
          data.map((edu) => (
            <div key={edu.id} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/20">
              <div
                onClick={() => setExpandedId(expandedId === edu.id ? null : edu.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">{edu.fieldOfStudy}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {edu.school} {edu.degree ? `(${edu.degree})` : ""}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> {edu.startDate || t.noDate} – {edu.endDate || t.presentOrNoDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleDelete(edu.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50/50 transition-colors cursor-pointer"
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === edu.id ? null : edu.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {expandedId === edu.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Formularz edycji rozwijany */}
              {expandedId === edu.id && (
                <div className="px-4 pb-4 border-t border-slate-100 bg-white/80 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t.eduSchoolLabel}</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => handleItemChange(edu.id, "school", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t.eduFieldLabel}</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleItemChange(edu.id, "fieldOfStudy", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t.eduDegreeLabel}</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleItemChange(edu.id, "degree", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t.expStartDateLabel}</label>
                        <input
                          type="month"
                          value={edu.startDate}
                          onChange={(e) => handleItemChange(edu.id, "startDate", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t.expEndDateLabel}</label>
                        <input
                          type="month"
                          value={edu.endDate}
                          onChange={(e) => handleItemChange(edu.id, "endDate", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t.eduDescLabel}</label>
                      <textarea
                        rows={2}
                        value={edu.description}
                        onChange={(e) => handleItemChange(edu.id, "description", e.target.value)}
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
