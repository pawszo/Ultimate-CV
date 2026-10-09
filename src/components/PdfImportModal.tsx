import React, { useState, useEffect } from "react";
import { UserProfile, PersonalDetails, Experience, Education, Skill, Achievement } from "../types";
import { X, Check, ArrowRight, Briefcase, BookOpen, Award, User, Info, CheckSquare, Square, Sparkles } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  parsedData: {
    personal?: Partial<PersonalDetails>;
    experience?: Partial<Experience>[];
    education?: Partial<Education>[];
    skills?: Partial<Skill>[];
    achievements?: Partial<Achievement>[];
  } | null;
  currentProfile: UserProfile;
  onApply: (updatedProfile: UserProfile) => void;
}

export const PdfImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  parsedData,
  currentProfile,
  onApply
}) => {
  const { t, language } = useLanguage();

  if (!isOpen || !parsedData) return null;

  // Stany selekcji
  const [importPersonal, setImportPersonal] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState<number[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<number[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [selectedAchievements, setSelectedAchievements] = useState<number[]>([]);

  // Zainicjalizuj wszystkie elementy jako zaznaczone po załadowaniu danych
  useEffect(() => {
    if (parsedData) {
      if (parsedData.experience) {
        setSelectedExperience(parsedData.experience.map((_, idx) => idx));
      }
      if (parsedData.education) {
        setSelectedEducation(parsedData.education.map((_, idx) => idx));
      }
      if (parsedData.skills) {
        setSelectedSkills(parsedData.skills.map((_, idx) => idx));
      }
      if (parsedData.achievements) {
        setSelectedAchievements(parsedData.achievements.map((_, idx) => idx));
      }
    }
  }, [parsedData]);

  const toggleExperience = (idx: number) => {
    setSelectedExperience(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const toggleEducation = (idx: number) => {
    setSelectedEducation(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const toggleSkill = (idx: number) => {
    setSelectedSkills(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const toggleAchievement = (idx: number) => {
    setSelectedAchievements(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleMerge = () => {
    const updatedPersonal: PersonalDetails = importPersonal && parsedData.personal
      ? {
          name: parsedData.personal.name || currentProfile.personal.name,
          email: parsedData.personal.email || currentProfile.personal.email,
          phone: parsedData.personal.phone || currentProfile.personal.phone,
          website: parsedData.personal.website || currentProfile.personal.website,
          linkedin: parsedData.personal.linkedin || currentProfile.personal.linkedin,
          location: parsedData.personal.location || currentProfile.personal.location,
          bio: parsedData.personal.bio || currentProfile.personal.bio,
          photo: currentProfile.personal.photo
        }
      : currentProfile.personal;

    const newExperiences: Experience[] = (parsedData.experience || [])
      .filter((_, idx) => selectedExperience.includes(idx))
      .map((exp, idx) => ({
        id: "exp-pdf-" + Date.now() + "-" + idx,
        company: exp.company || (language === "en" ? "Company" : "Firma"),
        role: exp.role || (language === "en" ? "Position" : "Stanowisko"),
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        isCurrent: exp.isCurrent || false,
        description: exp.description || "",
        location: exp.location || ""
      }));

    const newEducation: Education[] = (parsedData.education || [])
      .filter((_, idx) => selectedEducation.includes(idx))
      .map((edu, idx) => ({
        id: "edu-pdf-" + Date.now() + "-" + idx,
        school: edu.school || (language === "en" ? "School" : "Uczelnia"),
        degree: edu.degree || "",
        fieldOfStudy: edu.fieldOfStudy || "",
        startDate: edu.startDate || "",
        endDate: edu.endDate || "",
        description: edu.description || ""
      }));

    const newSkills: Skill[] = (parsedData.skills || [])
      .filter((_, idx) => selectedSkills.includes(idx))
      .map((sk, idx) => ({
        id: "sk-pdf-" + Date.now() + "-" + idx,
        name: sk.name || (language === "en" ? "Skill" : "Umiejętność"),
        category: sk.category || (language === "en" ? "Other" : "Inne"),
        proficiency: sk.proficiency || "Średni"
      }));

    const newAchievements: Achievement[] = (parsedData.achievements || [])
      .filter((_, idx) => selectedAchievements.includes(idx))
      .map((ach, idx) => ({
        id: "ach-pdf-" + Date.now() + "-" + idx,
        title: ach.title || (language === "en" ? "Achievement" : "Osiągnięcie"),
        description: ach.description || "",
        date: ach.date || ""
      }));

    const mergedExperience = [...currentProfile.experience];
    newExperiences.forEach(newExp => {
      const isDuplicate = mergedExperience.some(
        exp => exp.company.toLowerCase() === newExp.company.toLowerCase() && 
               exp.role.toLowerCase() === newExp.role.toLowerCase()
      );
      if (!isDuplicate) {
        mergedExperience.push(newExp);
      }
    });

    const mergedEducation = [...currentProfile.education];
    newEducation.forEach(newEdu => {
      const isDuplicate = mergedEducation.some(
        edu => edu.school.toLowerCase() === newEdu.school.toLowerCase() && 
               edu.fieldOfStudy.toLowerCase() === newEdu.fieldOfStudy.toLowerCase()
      );
      if (!isDuplicate) {
        mergedEducation.push(newEdu);
      }
    });

    const mergedSkills = [...currentProfile.skills];
    newSkills.forEach(newSk => {
      const isDuplicate = mergedSkills.some(
        sk => sk.name.toLowerCase() === newSk.name.toLowerCase()
      );
      if (!isDuplicate) {
        mergedSkills.push(newSk);
      }
    });

    const mergedAchievements = [...currentProfile.achievements];
    newAchievements.forEach(newAch => {
      const isDuplicate = mergedAchievements.some(
        ach => ach.title.toLowerCase() === newAch.title.toLowerCase()
      );
      if (!isDuplicate) {
        mergedAchievements.push(newAch);
      }
    });

    onApply({
      ...currentProfile,
      personal: updatedPersonal,
      experience: mergedExperience,
      education: mergedEducation,
      skills: mergedSkills,
      languages: currentProfile.languages || [],
      achievements: mergedAchievements
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            <div>
              <h3 className="font-bold text-sm font-display">{t.pdfModalTitle}</h3>
              <p className="text-[11px] text-slate-400">{t.pdfModalSub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Informacja */}
          <div className="bg-blue-50 border border-blue-150 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-blue-800">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              {language === "en"
                ? "The system automatically filters duplicates upon merging. Entries with identical roles or skills already present in your profile will be preserved cleanly."
                : "System automatycznie eliminuje duplikaty przy scalaniu. Elementy o takich samych nazwach stanowisk lub umiejętnościach, które już masz w profilu, zostaną pominięte, aby zachować porządek."}
            </p>
          </div>

          {/* DANE OSOBOWE */}
          {parsedData.personal && (
            <div className="space-y-3 border-b border-slate-100 pb-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" /> {t.personalTitle}
                </h4>
                <button
                  onClick={() => setImportPersonal(!importPersonal)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {importPersonal ? (
                    <>
                      <CheckSquare className="w-4 h-4" /> {language === "en" ? "Import details" : "Importuj te dane"}
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4" /> {language === "en" ? "Skip details" : "Pomiń te dane"}
                    </>
                  )}
                </button>
              </div>

              {importPersonal && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">{t.fullName}</span>
                      <span className="text-slate-800 font-medium">{parsedData.personal.name || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">{t.location}</span>
                      <span className="text-slate-800 font-medium">{parsedData.personal.location || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">{t.email}</span>
                      <span className="text-slate-800 font-medium">{parsedData.personal.email || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">{t.phone}</span>
                      <span className="text-slate-800 font-medium">{parsedData.personal.phone || "—"}</span>
                    </div>
                  </div>
                  {parsedData.personal.bio && (
                    <div className="border-t border-slate-200 pt-2.5">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">{t.bio}</span>
                      <p className="text-slate-600 italic mt-1 font-serif">"{parsedData.personal.bio}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DOŚWIADCZENIE ZAWODOWE */}
          {parsedData.experience && parsedData.experience.length > 0 && (
            <div className="space-y-3 border-b border-slate-100 pb-5">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-rose-500" /> {t.expTitle} ({parsedData.experience.length})
              </h4>
              <div className="space-y-2">
                {parsedData.experience.map((exp, idx) => {
                  const isSelected = selectedExperience.includes(idx);
                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleExperience(idx)}
                      className={`p-3.5 border rounded-xl text-xs flex gap-3 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-rose-200 bg-rose-50/20" 
                          : "border-slate-150 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 shrink-0 ${
                        isSelected ? "bg-rose-500 border-rose-500 text-white" : "border-slate-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <strong className="text-slate-800">{exp.role}</strong>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {exp.startDate} – {exp.endDate || (exp.isCurrent ? t.present : "—")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{exp.company} {exp.location ? `• ${exp.location}` : ""}</p>
                        {exp.description && <p className="text-slate-600 mt-1 line-clamp-2">{exp.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EDUKACJA */}
          {parsedData.education && parsedData.education.length > 0 && (
            <div className="space-y-3 border-b border-slate-100 pb-5">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" /> {t.eduTitle} ({parsedData.education.length})
              </h4>
              <div className="space-y-2">
                {parsedData.education.map((edu, idx) => {
                  const isSelected = selectedEducation.includes(idx);
                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleEducation(idx)}
                      className={`p-3.5 border rounded-xl text-xs flex gap-3 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-blue-200 bg-blue-50/20" 
                          : "border-slate-150 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 shrink-0 ${
                        isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <strong className="text-slate-800">{edu.fieldOfStudy || edu.school}</strong>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {edu.startDate} – {edu.endDate || "—"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{edu.school} {edu.degree ? `(${edu.degree})` : ""}</p>
                        {edu.description && <p className="text-slate-600 mt-1 line-clamp-2">{edu.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* UMIEJĘTNOŚCI */}
          {parsedData.skills && parsedData.skills.length > 0 && (
            <div className="space-y-3 border-b border-slate-100 pb-5">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" /> {t.skillsTitle} ({parsedData.skills.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {parsedData.skills.map((sk, idx) => {
                  const isSelected = selectedSkills.includes(idx);
                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleSkill(idx)}
                      className={`p-2.5 border rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-emerald-200 bg-emerald-50/30 text-emerald-900" 
                          : "border-slate-150 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <div className="min-w-0">
                        <strong className="text-slate-800 block truncate">{sk.name}</strong>
                        <span className="text-[9px] text-slate-400 block truncate">{sk.category || "Inne"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* OSIĄGNIĘCIA I CERTYFIKATY */}
          {parsedData.achievements && parsedData.achievements.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> {t.achTitle} ({parsedData.achievements.length})
              </h4>
              <div className="space-y-2">
                {parsedData.achievements.map((ach, idx) => {
                  const isSelected = selectedAchievements.includes(idx);
                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleAchievement(idx)}
                      className={`p-3.5 border rounded-xl text-xs flex gap-3 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-amber-200 bg-amber-50/20" 
                          : "border-slate-150 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 shrink-0 ${
                        isSelected ? "bg-amber-500 border-amber-500 text-white" : "border-slate-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <strong className="text-slate-800">{ach.title}</strong>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{ach.date}</span>
                        </div>
                        {ach.description && <p className="text-slate-500 mt-1">{ach.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleMerge}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {t.applySelected} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
