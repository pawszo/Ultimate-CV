import React, { useState } from "react";
import { Achievement } from "../types";
import { Trophy, Plus, Trash2, Calendar, Award } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  data: Achievement[];
  onChange: (data: Achievement[]) => void;
}

export const AchievementsForm: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);

  const [newAch, setNewAch] = useState<Omit<Achievement, "id">>({
    title: "",
    description: "",
    date: "",
  });

  const handleAdd = () => {
    if (!newAch.title) {
      alert(t.achTitleRequired);
      return;
    }
    const created: Achievement = {
      ...newAch,
      id: "ach-" + Date.now(),
    };
    onChange([...data, created]);
    setNewAch({
      title: "",
      description: "",
      date: "",
    });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onChange(data.filter((e) => e.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 font-display">{t.achTitle}</h2>
            <p className="text-xs text-slate-400">{t.achSubtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t.addAchBtn}
        </button>
      </div>

      {/* Formularz dodawania */}
      {isAdding && (
        <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.addNewAch}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={t.achTitlePlaceholder}
              value={newAch.title}
              onChange={(e) => setNewAch({ ...newAch, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            />
            <input
              type="month"
              value={newAch.date}
              onChange={(e) => setNewAch({ ...newAch, date: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            />
            <textarea
              placeholder={t.achDescPlaceholder}
              rows={2}
              value={newAch.description}
              onChange={(e) => setNewAch({ ...newAch, description: e.target.value })}
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
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 cursor-pointer"
            >
              {t.save}
            </button>
          </div>
        </div>
      )}

      {/* Lista osiągnięć */}
      <div className="space-y-3">
        {data.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">{t.achEmpty}</p>
        ) : (
          data.map((ach) => (
            <div key={ach.id} className="p-4 bg-slate-50/30 border border-slate-100 rounded-xl flex gap-4 justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-700">{ach.title}</h3>
                  {ach.date && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> {ach.date}
                    </p>
                  )}
                  {ach.description && <p className="text-[11px] text-slate-500 mt-1.5">{ach.description}</p>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(ach.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50/50 transition-colors cursor-pointer"
                title={t.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
