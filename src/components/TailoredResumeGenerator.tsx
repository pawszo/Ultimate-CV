import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { TailoredResume, UserProfile } from "../types";
import { 
  Sparkles, FileText, ChevronRight, Copy, Printer, Check, Info, 
  Briefcase, Award, CheckCircle2, Sliders,
  Edit3, Eye, Undo2, Bold, List, Code, Heading2, Download, Globe2,
  FileDown, X
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export interface DocumentLanguageOption {
  code: string;
  name: string;
  flag: string;
}

export const DOC_LANGUAGES: DocumentLanguageOption[] = [
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" }
];

interface Props {
  profile: UserProfile;
  onGenerate: (jobOffer: string, includePhoto: boolean, templateId: string, resumeLanguage?: string) => Promise<void>;
  tailoredResume: TailoredResume | null;
  isGenerating: boolean;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  styleClass: string;
  iconColor: string;
  promptInstruction: string;
}

export const getTemplates = (lang: "pl" | "en"): ResumeTemplate[] => [
  {
    id: "classic",
    name: lang === "en" ? "Classic Business" : "Klasyczny Biznesowy",
    description: lang === "en"
      ? "Traditional, formal, and balanced layout. Ideal for banking, corporate, legal, and managerial roles."
      : "Tradycyjny, formalny i zrównoważony układ. Idealny do bankowości, korporacji, prawa i ról menedżerskich.",
    badge: lang === "en" ? "Formal" : "Formalny",
    iconColor: "text-blue-600 bg-blue-50 border-blue-100",
    styleClass: "prose-classic font-serif text-slate-900 bg-white max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:border-b-2 [&_h1]:border-slate-800 [&_h1]:pb-1 [&_h1]:mb-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-800 [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-slate-200 [&_h2]:pb-0.5 [&_p]:text-xs [&_p]:leading-relaxed [&_li]:text-xs [&_li]:leading-relaxed [&_hr]:my-4 [&_hr]:border-slate-300",
    promptInstruction: "Zastosuj styl tradycyjny, konserwatywny i profesjonalny."
  },
  {
    id: "modern",
    name: lang === "en" ? "Modern Minimalist" : "Nowoczesny Minimalistyczny",
    description: lang === "en"
      ? "Light, spacious layout with subtle details. Excellent for creative industries, marketing, HR, and startups."
      : "Lekki, przestrzenny układ z subtelnymi detalami. Doskonały dla branży kreatywnej, marketingu, HR i startupów.",
    badge: "SaaS / Startup",
    iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
    styleClass: "prose-modern font-sans text-slate-800 bg-white max-w-none [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-indigo-950 [&_h1]:mb-3 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-wider [&_h2]:text-indigo-600 [&_h2]:border-b [&_h2]:border-slate-100 [&_h2]:pb-1 [&_h2]:mt-5 [&_h2]:mb-2 [&_p]:text-xs [&_p]:text-slate-600 [&_li]:text-xs [&_li]:text-slate-600 [&_hr]:hidden",
    promptInstruction: "Zastosuj styl nowoczesny i minimalistyczny."
  },
  {
    id: "tech",
    name: lang === "en" ? "IT / Engineering (Software & DevOps)" : "IT / Inżynieria (Software & DevOps)",
    description: lang === "en"
      ? "Modern architectural engineering layout with clean content hierarchy, tech tags, and precise typography."
      : "Nowoczesny, architektoniczny układ inżynieryjny z czytelną architekturą treści, tagami technologii i precyzyjną typografią.",
    badge: lang === "en" ? "IT / Engineering" : "IT / Inżynieria",
    iconColor: "text-sky-600 bg-sky-50 border-sky-200",
    styleClass: "prose-tech max-w-none",
    promptInstruction: "Zastosuj nowoczesny, czysty styl IT / Inżynieria (Software & DevOps) bez znaków '//'."
  },
  {
    id: "creative",
    name: lang === "en" ? "Creative with Accent" : "Kreatywny z Akcentem",
    description: lang === "en"
      ? "Distinctive layout with energetic left accent bar and bold visual hierarchy."
      : "Wyróżniający się układ z lewym paskiem akcentującym i energetycznymi akcentami kolorystycznymi.",
    badge: lang === "en" ? "UX / Creative" : "UX / Kreatywny",
    iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    styleClass: "prose-creative font-sans text-slate-800 bg-white max-w-none border-l-4 border-emerald-500 pl-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-emerald-950 [&_h1]:mb-3 [&_h2]:text-sm [&_h2]:font-extrabold [&_h2]:text-emerald-700 [&_h2]:bg-emerald-50/70 [&_h2]:px-2 [&_h2]:py-0.5 [&_h2]:rounded [&_h2]:inline-block [&_h2]:mt-4 [&_h2]:mb-2 [&_p]:text-xs [&_li]:text-xs [&_hr]:my-3 [&_hr]:border-emerald-100",
    promptInstruction: "Zastosuj styl kreatywny i dynamiczny."
  }
];

export const TailoredResumeGenerator: React.FC<Props> = ({
  profile,
  onGenerate,
  tailoredResume,
  isGenerating
}) => {
  const { t, language, interpolate } = useLanguage();
  const [jobOffer, setJobOffer] = useState("");
  const [copied, setCopied] = useState(false);
  const [includePhoto, setIncludePhoto] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState("classic");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [densityMode, setDensityMode] = useState<"auto" | "compact" | "ultracompact" | "standard" | "spacious">("auto");
  const [effectiveDensity, setEffectiveDensity] = useState<string>("density-compact");
  const [measuredPages, setMeasuredPages] = useState<number>(1);
  const [editedMarkdown, setEditedMarkdown] = useState<string>("");
  const [activeTabMode, setActiveTabMode] = useState<"preview" | "edit">("preview");
  const [targetResumeLang, setTargetResumeLang] = useState<string>(language);
  const [lookupLanguage, setLookupLanguage] = useState<string>(language);
  const [exportLanguage, setExportLanguage] = useState<string>(language);
  const [translationsCache, setTranslationsCache] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "md" | "txt">("pdf");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const resumePrintRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync target language if UI language changes initially
  useEffect(() => {
    setTargetResumeLang(language);
  }, [language]);

  const templates = getTemplates(language);
  const activeTemplate = templates.find(tpl => tpl.id === selectedTemplateId) || templates[0];

  // Synchronizacja edytowanego tekstu z nowo wygenerowanym CV
  useEffect(() => {
    if (tailoredResume?.tailoredResumeMarkdown) {
      setEditedMarkdown(tailoredResume.tailoredResumeMarkdown);
      const initialLang = (tailoredResume as any).language || targetResumeLang || language;
      setLookupLanguage(initialLang);
      setExportLanguage(initialLang);
      setTranslationsCache(prev => ({
        ...prev,
        [initialLang]: tailoredResume.tailoredResumeMarkdown
      }));
    }
  }, [tailoredResume?.tailoredResumeMarkdown]);

  const currentMarkdown = editedMarkdown || tailoredResume?.tailoredResumeMarkdown || "";

  // Inteligentne dopasowywanie zagęszczenia tekstu pod 1 pełną stronę A4
  useEffect(() => {
    if (!currentMarkdown) return;
    const charLen = currentMarkdown.length;

    if (densityMode === "auto") {
      if (charLen > 2000) {
        setEffectiveDensity("");
      } else if (charLen > 1250) {
        setEffectiveDensity("density-ultracompact");
      } else if (charLen > 650) {
        setEffectiveDensity("density-compact");
      } else {
        setEffectiveDensity("density-spacious");
      }
    } else if (densityMode === "ultracompact") {
      setEffectiveDensity("density-ultracompact");
    } else if (densityMode === "compact") {
      setEffectiveDensity("density-compact");
    } else if (densityMode === "spacious") {
      setEffectiveDensity("density-spacious");
    } else {
      setEffectiveDensity("");
    }
  }, [currentMarkdown, densityMode]);

  // Pomiar wysokości i liczby stron A4 w czasie rzeczywistym
  useEffect(() => {
    if (!resumePrintRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        const pages = Math.max(1, Math.ceil(height / 1060));
        setMeasuredPages(pages);
      }
    });
    observer.observe(resumePrintRef.current);
    return () => observer.disconnect();
  }, [currentMarkdown, effectiveDensity]);

  const insertFormatting = (prefix: string, suffix: string, placeholder: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentMarkdown.substring(start, end);
    const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}${placeholder}${suffix}`;
    const nextMarkdown = currentMarkdown.substring(0, start) + replacement + currentMarkdown.substring(end);
    setEditedMarkdown(nextMarkdown);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : placeholder.length)
      );
    }, 0);
  };

  const handleCopyMarkdown = () => {
    if (!currentMarkdown) return;
    navigator.clipboard.writeText(currentMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = async () => {
    if (activeTabMode === "edit") {
      setActiveTabMode("preview");
      await new Promise((r) => setTimeout(r, 60));
    }
    window.print();
  };

  // Przełączanie języka podglądu dokumentu (Lookup) w locie
  const handleSwitchLookupLanguage = async (newLang: string) => {
    if (newLang === lookupLanguage) return;

    if (translationsCache[newLang]) {
      setEditedMarkdown(translationsCache[newLang]);
      setLookupLanguage(newLang);
      setExportLanguage(newLang);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch("/api/gemini/translate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: currentMarkdown,
          targetLanguage: newLang,
          sourceLanguage: lookupLanguage
        })
      });

      if (!res.ok) {
        throw new Error("Błąd podczas tłumaczenia dokumentu");
      }

      const data = await res.json();
      if (data.translatedMarkdown) {
        setTranslationsCache(prev => ({
          ...prev,
          [newLang]: data.translatedMarkdown
        }));
        setEditedMarkdown(data.translatedMarkdown);
        setLookupLanguage(newLang);
        setExportLanguage(newLang);
        const langObj = DOC_LANGUAGES.find(l => l.code === newLang);
        setToastMsg(interpolate(t.translateSuccess, { lang: langObj?.name || newLang.toUpperCase() }));
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (err: any) {
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Pobieranie pliku Markdown (.md)
  const handleDownloadMarkdown = (targetLang: string = exportLanguage) => {
    const content = translationsCache[targetLang] || (targetLang === lookupLanguage ? currentMarkdown : "");
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const rawName = profile?.personal?.name || "kandydat";
    const cleanName = rawName.trim().replace(/\s+/g, "_") || "resume";
    link.href = url;
    link.download = `CV_${cleanName}_${targetLang.toUpperCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMsg(t.downloadedMd);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Pobieranie pliku czystego tekstu (.txt)
  const handleDownloadTxt = (targetLang: string = exportLanguage) => {
    const content = translationsCache[targetLang] || (targetLang === lookupLanguage ? currentMarkdown : "");
    if (!content) return;
    const plainText = content
      .replace(/^#+\s+/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1");
    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const rawName = profile?.personal?.name || "kandydat";
    const cleanName = rawName.trim().replace(/\s+/g, "_") || "resume";
    link.href = url;
    link.download = `CV_${cleanName}_${targetLang.toUpperCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMsg(t.downloadedTxt);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Pobieranie gotowego dokumentu PDF z uwzględnieniem wybranego języka
  const handleDownloadPdf = async (targetLang: string = exportLanguage) => {
    if (!resumePrintRef.current || !tailoredResume) return;

    if (targetLang !== lookupLanguage) {
      await handleSwitchLookupLanguage(targetLang);
      await new Promise(r => setTimeout(r, 120));
    }

    if (activeTabMode === "edit") {
      setActiveTabMode("preview");
      await new Promise((r) => setTimeout(r, 80));
    }

    setIsExportingPdf(true);

    try {
      const element = resumePrintRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: selectedTemplateId === "tech" ? "#fbfbfa" : "#ffffff",
        windowWidth: 794,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector("[data-resume-card]") as HTMLElement;
          if (el) {
            el.style.borderRadius = "0px";
            el.style.border = "none";
            el.style.boxShadow = "none";
            el.style.padding = "24px 32px";
            el.style.width = "794px";
            el.style.maxWidth = "794px";

            if ((densityMode === "auto" || densityMode === "compact") && el.offsetHeight > 1050 && el.offsetHeight < 1400) {
              const mb = el.querySelector(".markdown-body");
              if (mb) {
                mb.classList.remove("density-compact", "density-spacious");
                mb.classList.add("density-ultracompact");
              }
            }
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 12) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      const rawName = profile?.personal?.name || "kandydat";
      const cleanName = rawName.trim().replace(/\s+/g, "_") || "resume";
      const filename = `CV_${cleanName}_${targetLang.toUpperCase()}.pdf`;
      pdf.save(filename);

      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 2500);
    } catch (err: any) {
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Wykonanie wybranego eksportu z okna dialogowego
  const handleExecuteExport = async () => {
    setShowExportModal(false);
    if (exportFormat === "pdf") {
      await handleDownloadPdf(exportLanguage);
    } else if (exportFormat === "md") {
      if (exportLanguage !== lookupLanguage && !translationsCache[exportLanguage]) {
        await handleSwitchLookupLanguage(exportLanguage);
      }
      handleDownloadMarkdown(exportLanguage);
    } else if (exportFormat === "txt") {
      if (exportLanguage !== lookupLanguage && !translationsCache[exportLanguage]) {
        await handleSwitchLookupLanguage(exportLanguage);
      }
      handleDownloadTxt(exportLanguage);
    }
  };

  const wordCount = currentMarkdown.trim().split(/\s+/).filter(Boolean).length;
  const charCount = currentMarkdown.length;

  return (
    <div className="space-y-6">
      {/* Sekcja wprowadzania oferty pracy i wyboru szablonu */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6 no-print">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 font-display">{t.tailorTitle}</h2>
              <p className="text-xs text-slate-400">{t.tailorSubtitle}</p>
            </div>
          </div>

          {/* Szybki wybór języka generowanego CV */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Globe2 className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-600 text-[11px] hidden sm:inline">{t.resumeLangBadge}</span>
            <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200">
              {DOC_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setTargetResumeLang(l.code)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                    targetResumeLang === l.code ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                  title={l.name}
                >
                  <span>{l.flag}</span>
                  <span>{l.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Textarea dla Oferty Pracy */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500">{t.jobOfferLabel}</label>
            <span className="text-[10px] text-slate-400 italic">{t.generateGeneralCvHint}</span>
          </div>
          <textarea
            value={jobOffer}
            onChange={(e) => setJobOffer(e.target.value)}
            rows={4}
            placeholder={t.jobOfferPlaceholder}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {/* INTERAKTYWNA GALERIA SZABLONÓW */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> {t.templateStyleLabel}
            </label>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold">
              {activeTemplate.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {templates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-36 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10 shadow-xs"
                      : "border-slate-150 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 text-blue-600">
                      <CheckCircle2 className="w-5 h-5 fill-blue-50" />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${tpl.iconColor}`}>
                      {tpl.badge}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 pr-6">{tpl.name}</h4>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-3">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="text-[10px] font-semibold text-blue-600 flex items-center gap-1">
                    <span>{t.applyThisStyle}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OPCJE GENEROWANIA (Checkbox dla Zdjęcia) */}
        <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="includePhotoCheckbox"
              checked={includePhoto}
              onChange={(e) => setIncludePhoto(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 rounded-sm focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="includePhotoCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer select-none">
              {t.includePhotoLabel}
              <span className="block text-[10px] text-slate-400 font-normal">
                {profile.personal.photo
                  ? t.photoUploadedHint
                  : t.photoMissingHint}
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onGenerate(jobOffer, includePhoto, selectedTemplateId, targetResumeLang)}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {interpolate(t.optimizingResume, { tpl: activeTemplate.name })}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 animate-bounce" />
                {jobOffer.trim()
                  ? `${t.generateWithAiBtn} (${targetResumeLang.toUpperCase()})`
                  : `${t.generateGeneralCvBtn} (${targetResumeLang.toUpperCase()})`}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Rezultaty */}
      {tailoredResume && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Decyzje i uzasadnienia rekrutacyjne */}
          <div className="space-y-6 no-print lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 font-display flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-500" /> {t.aiDecisionsTitle}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.aiDecisionsDesc}
              </p>

              <div className="space-y-3">
                {tailoredResume.tailoringDecisions.map((decision, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{decision.itemName}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                          decision.action.includes("Wyróżniono") || decision.action.toLowerCase().includes("highlight")
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : decision.action.includes("Pominięto") || decision.action.toLowerCase().includes("omit")
                            ? "bg-rose-50 border-rose-100 text-rose-600"
                            : "bg-amber-50 border-amber-100 text-amber-700"
                        }`}
                      >
                        {decision.action}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">{decision.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> {t.tailoredSummaryTitle}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{tailoredResume.professionalSummary}"
              </p>
            </div>
          </div>

          {/* Podgląd CV (Markdown) */}
          <div className="lg:col-span-2 space-y-4">
            {/* PASEK WYBORU JĘZYKA PODGLĄDU (LOOKUP) ORAZ EKSPORTU */}
            <div className="no-print bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl text-indigo-300">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-display">{t.lookupLangLabel}</span>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full font-semibold uppercase">
                      {lookupLanguage.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-indigo-200/70">{t.lookupLangDesc}</p>
                </div>
              </div>

              {/* Przyciski zmiany języka podglądu (Lookup) */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex bg-white/10 p-0.5 rounded-xl border border-white/15">
                  {DOC_LANGUAGES.map((l) => {
                    const isActive = lookupLanguage === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        disabled={isTranslating}
                        onClick={() => handleSwitchLookupLanguage(l.code)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isActive
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-300 hover:text-white hover:bg-white/10"
                        }`}
                        title={`${l.name} (${l.code.toUpperCase()})`}
                      >
                        <span>{l.flag}</span>
                        <span className="text-[11px]">{l.code.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Przycisk otwarcia modalu opcji eksportu pliku */}
                <button
                  type="button"
                  onClick={() => {
                    setExportLanguage(lookupLanguage);
                    setShowExportModal(true);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Wybierz język oraz format eksportowanego pliku (PDF, MD, TXT)"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{t.exportFileBtn}</span>
                </button>
              </div>
            </div>

            {/* Komunikat o trwającym tłumaczeniu podglądu */}
            {isTranslating && (
              <div className="no-print bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-pulse shadow-2xs">
                <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <span>{interpolate(t.translatingLookup, { lang: DOC_LANGUAGES.find(l => l.code === lookupLanguage)?.name || lookupLanguage.toUpperCase() })}</span>
              </div>
            )}

            {/* Komunikat o sukcesie */}
            {toastMsg && (
              <div className="no-print bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{toastMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between no-print bg-white rounded-xl border border-slate-100 p-4 gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-600 block">{t.readyDocPreview}</span>
                <span className="text-[10px] text-slate-400 font-medium">{t.switchTemplateFly}</span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Selektor szablonu w locie */}
                <div className="flex items-center bg-slate-50 border border-slate-200 p-0.5 rounded-lg">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        selectedTemplateId === tpl.id
                          ? "bg-white text-slate-800 shadow-2xs border border-slate-200/50"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                      title={tpl.name}
                    >
                      {tpl.badge}
                    </button>
                  ))}
                </div>

                <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

                <button
                  onClick={handleCopyMarkdown}
                  className="p-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-150"
                  title="Skopiuj kod Markdown"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? t.copiedBtn : t.copyBtn}
                </button>

                {/* Szybki przycisk pobierania PDF w bieżącym języku */}
                <button
                  onClick={() => handleDownloadPdf(lookupLanguage)}
                  disabled={isExportingPdf || isTranslating}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  title={`Pobierz plik PDF w języku ${lookupLanguage.toUpperCase()}`}
                >
                  {isExportingPdf ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t.creatingPdf}</span>
                    </>
                  ) : pdfDownloaded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>{t.downloadedPdf}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{t.downloadPdfBtn} ({lookupLanguage.toUpperCase()})</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="p-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-150 hidden sm:flex"
                  title="Wydrukuj bezpośrednio przez okno drukarki"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.printerBtn}</span>
                </button>
              </div>
            </div>

            {/* Pasek optymalizacji pod pełne strony A4 */}
            <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100/80 px-4 py-2.5 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  {t.a4Format}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  measuredPages === 1 
                    ? "bg-emerald-100/80 text-emerald-800 border border-emerald-300/60" 
                    : "bg-blue-100/80 text-blue-800 border border-blue-300/60"
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {measuredPages === 1 ? t.a4SinglePage : interpolate(t.a4MultiPage, { n: measuredPages })}
                </span>
                {densityMode === "auto" && (
                  <span className="text-[10px] text-slate-500 hidden sm:inline-block">
                    {t.autoScalingActive}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-500 text-[11px] font-medium mr-1 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-slate-400" />
                  {t.textSizeLabel}
                </span>
                <div className="inline-flex bg-white border border-slate-200 p-0.5 rounded-lg shadow-2xs">
                  <button
                    onClick={() => setDensityMode("auto")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      densityMode === "auto"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Auto"
                  >
                    {t.densityAuto}
                  </button>
                  <button
                    onClick={() => setDensityMode("compact")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      densityMode === "compact"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title={t.densityCompact}
                  >
                    {t.densityCompact}
                  </button>
                  <button
                    onClick={() => setDensityMode("ultracompact")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      densityMode === "ultracompact"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title={t.densityUltra}
                  >
                    {t.densityUltra}
                  </button>
                  <button
                    onClick={() => setDensityMode("standard")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      densityMode === "standard"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title={t.densityStandard}
                  >
                    {t.densityStandard}
                  </button>
                  <button
                    onClick={() => setDensityMode("spacious")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      densityMode === "spacious"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title={t.densitySpacious}
                  >
                    {t.densitySpacious}
                  </button>
                </div>
              </div>
            </div>

            {/* Przełącznik trybu: Podgląd dokumentu vs Edytor treści */}
            <div className="flex items-center justify-between no-print pt-1">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTabMode("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTabMode === "preview"
                      ? "bg-white text-slate-800 shadow-2xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.previewDocTab}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabMode("edit")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTabMode === "edit"
                      ? "bg-white text-slate-800 shadow-2xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t.editMarkdownTab}</span>
                </button>
              </div>

              {activeTabMode === "preview" && (
                <button
                  type="button"
                  onClick={() => setActiveTabMode("edit")}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t.wantToEditNotice}</span>
                </button>
              )}
            </div>

            {/* PANEL EDYTORA TREŚCI PRZED EKSPORTEM */}
            {activeTabMode === "edit" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 no-print animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{t.editorHeading}</h3>
                      <p className="text-[11px] text-slate-400">{t.editorSub}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(t.confirmRestoreAi)) {
                          setEditedMarkdown(tailoredResume.tailoredResumeMarkdown);
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={t.restoreAiVersion}
                    >
                      <Undo2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.restoreAiVersion}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTabMode("preview")}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.viewPreviewBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Narzędzia formatowania */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">{t.formatToolbar}</span>
                  <button
                    type="button"
                    onClick={() => insertFormatting("**", "**", language === "en" ? "bold text" : "pogrubiony tekst")}
                    className="p-1 px-2 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-xs font-bold cursor-pointer"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("## ", "", language === "en" ? "SECTION TITLE" : "NAZWA SEKCJI")}
                    className="p-1 px-2 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-xs font-bold cursor-pointer flex items-center gap-1"
                    title="Heading (## Title)"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("- ", "", language === "en" ? "Bullet item" : "Punkt listy")}
                    className="p-1 px-2 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-xs font-bold cursor-pointer flex items-center gap-1"
                    title="List item (- text)"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("`", "`", language === "en" ? "technology" : "technologia")}
                    className="p-1 px-2 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-xs font-bold cursor-pointer flex items-center gap-1"
                    title="Tech tag (`code`)"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <div className="ml-auto text-[11px] text-slate-400">
                    {interpolate(t.charsAndWords, { chars: charCount, words: wordCount })}
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  value={editedMarkdown}
                  onChange={(e) => setEditedMarkdown(e.target.value)}
                  rows={20}
                  className="w-full font-mono text-xs leading-relaxed p-4 rounded-xl border border-slate-200 bg-slate-50/40 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
                  placeholder="Markdown content..."
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-1 gap-2">
                  <span>{t.editorHint}</span>
                  <button
                    type="button"
                    onClick={() => setActiveTabMode("preview")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.applyAndPrintBtn}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Karta dokumentu gotowa do wydruku */}
            <div 
              ref={resumePrintRef}
              data-resume-card="true"
              className={`bg-white border border-slate-150 rounded-2xl p-8 shadow-xs md:p-12 print-only transition-all duration-300 ${
                selectedTemplateId === "tech" ? "border-slate-300 shadow-sm border-t-4 border-t-sky-600" : ""
              } ${activeTabMode === "edit" ? "hidden" : "block"}`}
            >
              {includePhoto && profile.personal.photo && (
                <div className="float-right ml-6 mb-4 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                  <img
                    src={profile.personal.photo}
                    alt="Profile"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className={`markdown-body ${activeTemplate.styleClass} ${effectiveDensity}`}>
                <ReactMarkdown>{currentMarkdown}</ReactMarkdown>
              </div>

              {measuredPages > 1 && (
                <div className="mt-8 pt-4 border-t-2 border-dashed border-amber-300 no-print flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-semibold text-amber-800 bg-amber-50/70 p-3 rounded-lg gap-2">
                  <span>{t.pageOverflowWarn}</span>
                  <button
                    onClick={() => setDensityMode("ultracompact")}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded font-bold transition-colors cursor-pointer shrink-0"
                  >
                    {t.shrinkToOnePageBtn}
                  </button>
                </div>
              )}
              <div className="clear-both" />
            </div>
          </div>
        </div>
      )}

      {/* Stan oczekiwania */}
      {isGenerating && (
        <div className="py-16 text-center space-y-4 bg-white rounded-2xl border border-slate-50 no-print">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-800">{t.geminiModeling}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {t.geminiModelingDesc} <strong className="text-blue-600">{activeTemplate.name}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* MODAL WYBORU JĘZYKA I FORMATU EKSPORTOWANEGO PLIKU */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 no-print animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header modalu */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl text-emerald-400">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-display">{t.exportFileBtn}</h3>
                  <p className="text-[10px] text-indigo-200/80">{t.exportOptionsTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Sekcja 1: Wybór języka eksportowanego pliku */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe2 className="w-4 h-4 text-indigo-600" />
                    {t.exportLangLabel}
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                    {DOC_LANGUAGES.find(l => l.code === exportLanguage)?.name || exportLanguage.toUpperCase()}
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DOC_LANGUAGES.map((l) => {
                    const isSelected = exportLanguage === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setExportLanguage(l.code)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-2 ring-indigo-500/10 shadow-2xs"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium"
                        }`}
                      >
                        <span className="text-base">{l.flag}</span>
                        <div className="truncate">
                          <span className="block text-xs leading-none">{l.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">{l.code}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sekcja 2: Format eksportu */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  {t.exportFormatLabel}
                </label>
                <div className="space-y-2">
                  <label
                    onClick={() => setExportFormat("pdf")}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      exportFormat === "pdf"
                        ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{t.exportAsPdf}</span>
                        <span className="text-[10px] text-slate-400">A4 • Render stylizowany • Gotowy do wysłania</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === "pdf"}
                      onChange={() => setExportFormat("pdf")}
                      className="text-blue-600"
                    />
                  </label>

                  <label
                    onClick={() => setExportFormat("md")}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      exportFormat === "md"
                        ? "border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/10"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        MD
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{t.exportAsMd}</span>
                        <span className="text-[10px] text-slate-400">Tekst ze znacznikami Markdown (.md)</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === "md"}
                      onChange={() => setExportFormat("md")}
                      className="text-indigo-600"
                    />
                  </label>

                  <label
                    onClick={() => setExportFormat("txt")}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      exportFormat === "txt"
                        ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/10"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        TXT
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{t.exportAsTxt}</span>
                        <span className="text-[10px] text-slate-400">Czysty tekst bez formatowania (do portali pracy)</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === "txt"}
                      onChange={() => setExportFormat("txt")}
                      className="text-emerald-600"
                    />
                  </label>
                </div>
              </div>

              {/* Informacja o synchronizacji */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{t.exportLangNotice}</span>
              </div>
            </div>

            {/* Stopka modalu */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {t.downloadFileBtn} ({exportFormat.toUpperCase()} - {exportLanguage.toUpperCase()})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
