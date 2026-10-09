import React, { useState } from "react";
import { AIConsensus, AIQuestion } from "../types";
import { Sparkles, HelpCircle, ArrowRight, Lightbulb, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  questions: AIQuestion[];
  conclusions: AIConsensus[];
  onAddSkill: (skillName: string, category: string) => void;
  onAnswerQuestion: (question: AIQuestion, answer: string) => Promise<void>;
  isLoadingQuestions: boolean;
  onRefreshQuestions: () => void;
  onDeleteConclusion: (index: number) => void;
}

export const AIAdvisor: React.FC<Props> = ({
  questions,
  conclusions,
  onAddSkill,
  onAnswerQuestion,
  isLoadingQuestions,
  onRefreshQuestions,
  onDeleteConclusion
}) => {
  const { t, language } = useLanguage();
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [answeringId, setAnsweringId] = useState<string | null>(null);

  const handleAnswerSubmit = async (q: AIQuestion) => {
    const text = answers[q.id];
    if (!text || !text.trim()) {
      alert(t.answerRequiredAlert);
      return;
    }
    setAnsweringId(q.id);
    await onAnswerQuestion(q, text.trim());
    setAnswers({
      ...answers,
      [q.id]: "",
    });
    setAnsweringId(null);
  };

  const getConclusionBadgeStyle = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes("twarda") || typeLower.includes("hard")) {
      return "bg-blue-50 border-blue-100 text-blue-700";
    }
    if (typeLower.includes("miękka") || typeLower.includes("soft")) {
      return "bg-emerald-50 border-emerald-100 text-emerald-700";
    }
    if (typeLower.includes("cecha") || typeLower.includes("trait")) {
      return "bg-purple-50 border-purple-100 text-purple-700";
    }
    if (typeLower.includes("wiedza") || typeLower.includes("knowledge") || typeLower.includes("branż")) {
      return "bg-amber-50 border-amber-100 text-amber-700";
    }
    return "bg-slate-50 border-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-6">
      {/* 1. Inteligentne Pytania Pomocnicze */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
              <HelpCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-semibold font-display">{t.advisorHeaderTitle}</h2>
              <p className="text-xs text-slate-300">{t.advisorHeaderSub}</p>
            </div>
          </div>
          <button
            onClick={onRefreshQuestions}
            disabled={isLoadingQuestions}
            className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50"
          >
            {isLoadingQuestions ? t.refreshingTips : t.refreshTipsBtn}
          </button>
        </div>

        {isLoadingQuestions ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
            <p className="text-xs text-slate-300">{t.analyzingProfileQuestions}</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center space-y-2">
            <p className="text-xs text-slate-300">{t.solidProfile}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1 bg-amber-500/20 text-amber-300 rounded-md mt-0.5 border border-amber-500/30">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold font-mono">
                      {t.sectionLabel} {q.field}
                    </span>
                    <h3 className="text-xs font-semibold text-white leading-relaxed">{q.question}</h3>
                    <p className="text-[10px] text-slate-300 leading-normal flex items-start gap-1">
                      <span>💡</span> {q.tip}
                    </p>
                  </div>
                </div>

                {/* Pole odpowiedzi użytkownika */}
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder={t.answerInputPlaceholder}
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAnswerSubmit(q);
                    }}
                    disabled={answeringId === q.id}
                    className="flex-1 bg-white/10 text-white placeholder-slate-400 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400/40 border border-transparent focus:border-blue-400/50"
                  />
                  <button
                    onClick={() => handleAnswerSubmit(q)}
                    disabled={answeringId === q.id || !answers[q.id]?.trim()}
                    className="px-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {answeringId === q.id ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {t.sendAnswerBtn} <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Wyciągnięte Wnioski AI */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-rose-500 text-white rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 font-display flex items-center gap-1.5">
              {t.conclusionsHeaderTitle}
            </h2>
            <p className="text-xs text-slate-400">
              {t.conclusionsHeaderSub}
            </p>
          </div>
        </div>

        {conclusions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {t.noConclusions}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conclusions.map((c, idx) => (
              <div
                key={idx}
                className="p-5 border border-slate-100 rounded-xl bg-slate-50/10 space-y-3 hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full uppercase ${getConclusionBadgeStyle(c.type)}`}>
                      {c.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">{t.confidenceLabel}</span>
                      <span className={`text-[10px] font-bold uppercase ${c.confidence === "wysoki" || c.confidence === "high" ? "text-emerald-600" : "text-amber-600"}`}>
                        {c.confidence}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">{c.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{c.explanation}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      let cat = language === "en" ? "Technical Skills" : "Umiejętności techniczne";
                      const tLower = c.type.toLowerCase();
                      if (tLower.includes("miękka") || tLower.includes("soft")) {
                        cat = language === "en" ? "Soft Skills" : "Umiejętności miękkie";
                      } else if (tLower.includes("dziedzinowa") || tLower.includes("branżowa") || tLower.includes("knowledge")) {
                        cat = language === "en" ? "Other" : "Inne";
                      } else if (tLower.includes("narzędzie") || tLower.includes("tool")) {
                        cat = language === "en" ? "Tools & Software" : "Narzędzia i oprogramowanie";
                      }
                      
                      onAddSkill(c.title, cat);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> {t.addToMyCvBtn}
                  </button>
                  <button
                    onClick={() => onDeleteConclusion(idx)}
                    className="p-1 text-slate-300 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                    title={t.rejectConclusionTooltip}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
