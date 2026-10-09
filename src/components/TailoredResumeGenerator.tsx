import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { TailoredResume, UserProfile } from "../types";
import { 
  Sparkles, FileText, ChevronRight, Copy, Printer, Check, Info, 
  Briefcase, Award, CheckCircle2, ShieldAlert, Zap, Layers, Download, Sliders,
  Edit3, Eye, Undo2, Bold, List, Code, Heading2
} from "lucide-react";

interface Props {
  profile: UserProfile;
  onGenerate: (jobOffer: string, includePhoto: boolean, templateId: string) => Promise<void>;
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

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Klasyczny Biznesowy",
    description: "Tradycyjny, formalny i zrównoważony układ. Idealny do bankowości, korporacji, prawa i ról menedżerskich.",
    badge: "Formalny",
    iconColor: "text-blue-600 bg-blue-50 border-blue-100",
    styleClass: "prose-classic font-serif text-slate-900 bg-white max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:border-b-2 [&_h1]:border-slate-800 [&_h1]:pb-1 [&_h1]:mb-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-800 [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-slate-200 [&_h2]:pb-0.5 [&_p]:text-xs [&_p]:leading-relaxed [&_li]:text-xs [&_li]:leading-relaxed [&_hr]:my-4 [&_hr]:border-slate-300",
    promptInstruction: "Zastosuj styl tradycyjny, konserwatywny i profesjonalny. Nagłówki powinny być czyste i stonowane. Nie używaj żadnych emoji ani emotikonów. Sformatuj sekcje w klasycznej, jednokolumnowej strukturze z wyraźnym podziałem na nagłówki."
  },
  {
    id: "modern",
    name: "Nowoczesny Minimalistyczny",
    description: "Lekki, przestrzenny układ z subtelnymi detalami. Doskonały dla branży kreatywnej, marketingu, HR i startupów.",
    badge: "SaaS / Startup",
    iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
    styleClass: "prose-modern font-sans text-slate-800 bg-white max-w-none [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-indigo-950 [&_h1]:mb-3 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-wider [&_h2]:text-indigo-600 [&_h2]:border-b [&_h2]:border-slate-100 [&_h2]:pb-1 [&_h2]:mt-5 [&_h2]:mb-2 [&_p]:text-xs [&_p]:text-slate-600 [&_li]:text-xs [&_li]:text-slate-600 [&_hr]:hidden",
    promptInstruction: "Zastosuj styl nowoczesny i minimalistyczny. Struktura powinna być przestronna, zwięzła i przejrzysta. Skoncentruj się na silnych słowach kluczowych i krótkich, uderzających wypunktowaniach. Używaj oszczędnego formatowania."
  },
  {
    id: "tech",
    name: "IT / Inżynieria (Software & DevOps)",
    description: "Nowoczesny, architektoniczny układ inżynieryjny z czytelną architekturą treści, tagami technologii i precyzyjną typografią.",
    badge: "IT / Inżynieria",
    iconColor: "text-sky-600 bg-sky-50 border-sky-200",
    styleClass: "prose-tech max-w-none",
    promptInstruction: "Zastosuj nowoczesny, czysty styl IT / Inżynieria (Software & DevOps). Nagłówki H2 sformatuj w stylu technicznym bez żadnych znaków '//' (np. '## UMIEJĘTNOŚCI TECHNICZNE', '## DOŚWIADCZENIE ZAWODOWE', '## JĘZYKI OBCE', '## EDUKACJA I CERTYFIKATY'). Wyróżniaj technologie, języki programowania i narzędzia znacznikami kodu markdown (np. `React`, `TypeScript`, `Docker`, `PostgreSQL`, `AWS`). Zapewnij dedykowaną sekcję na języki obce."
  },
  {
    id: "creative",
    name: "Kreatywny z Akcentem",
    description: "Wyróżniający się układ z lewym paskiem akcentującym i energetycznymi akcentami kolorystycznymi.",
    badge: "UX / Kreatywny",
    iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    styleClass: "prose-creative font-sans text-slate-800 bg-white max-w-none border-l-4 border-emerald-500 pl-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-emerald-950 [&_h1]:mb-3 [&_h2]:text-sm [&_h2]:font-extrabold [&_h2]:text-emerald-700 [&_h2]:bg-emerald-50/70 [&_h2]:px-2 [&_h2]:py-0.5 [&_h2]:rounded [&_h2]:inline-block [&_h2]:mt-4 [&_h2]:mb-2 [&_p]:text-xs [&_li]:text-xs [&_hr]:my-3 [&_hr]:border-emerald-100",
    promptInstruction: "Zastosuj styl kreatywny i dynamiczny. Możesz użyć nielicznych, nowoczesnych i profesjonalnych ikon/emotikonów jako punktorów przy sekcjach. Wstęp sformatuj w bardzo chwytliwy i angażujący sposób, aby od razu przykuć uwagę rekrutera."
  }
];

export const TailoredResumeGenerator: React.FC<Props> = ({
  profile,
  onGenerate,
  tailoredResume,
  isGenerating
}) => {
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
  const resumePrintRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronizacja edytowanego tekstu z nowo wygenerowanym CV
  useEffect(() => {
    if (tailoredResume?.tailoredResumeMarkdown) {
      setEditedMarkdown(tailoredResume.tailoredResumeMarkdown);
    }
  }, [tailoredResume?.tailoredResumeMarkdown]);

  const currentMarkdown = editedMarkdown || tailoredResume?.tailoredResumeMarkdown || "";

  // Inteligentne dopasowywanie zagęszczenia tekstu pod 1 pełną stronę A4
  useEffect(() => {
    if (!currentMarkdown) return;
    const charLen = currentMarkdown.length;

    if (densityMode === "auto") {
      // Automatyczny dobór czcionki i marginesów:
      // Jeśli CV jest długie (>1250 znaków), zmniejszamy czcionkę na ultracompact, by zmieścić na 1 stronie.
      // Jeśli standardowe (650-1250), używamy compact.
      // Jeśli bardzo krótkie (<650), używamy spacious, by ładnie wypełnić całą stronę.
      // Jeśli bardzo obszerne (>2000), standard na 2 pełne strony.
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
        // W proporcjach A4 (~794px szerokości), 1 strona A4 to ok. 1060px wysokości użytkowej
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

  const handleDownloadPdf = async () => {
    if (!resumePrintRef.current || !tailoredResume) return;

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

            // Jeśli tryb Auto lub Kompaktowy i dokument minimalnie wykracza ponad 1 stronę A4,
            // automatycznie dociśnij czcionkę, aby wymusić zmieszczenie na dokładnie 1 stronie PDF
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

      // Dodaj kolejną stronę tylko jeśli pozostała treść ma więcej niż 12mm (ochrona przed samotnymi linijkami)
      while (heightLeft > 12) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      const rawName = profile?.personal?.name || "kandydat";
      const cleanName = rawName.trim().replace(/\s+/g, "_") || "kandydat";
      const filename = `CV_${cleanName}_dopasowane.pdf`;
      pdf.save(filename);

      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 2500);
    } catch (err: any) {
      // W razie problemu z renderowaniem canvas, wywołaj bezpośredni wydruk systemowy
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const activeTemplate = RESUME_TEMPLATES.find(t => t.id === selectedTemplateId) || RESUME_TEMPLATES[0];

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
              <h2 className="text-lg font-semibold text-slate-800 font-display">Dopasuj CV pod Ofertę Pracy</h2>
              <p className="text-xs text-slate-400">Wklej ofertę, wybierz szablon wizualny i pozwól Gemini zoptymalizować dokument</p>
            </div>
          </div>
        </div>

        {/* Textarea dla Oferty Pracy */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Treść oferty pracy (wymagania, opis roli)</label>
          <textarea
            value={jobOffer}
            onChange={(e) => setJobOffer(e.target.value)}
            rows={4}
            placeholder="Wklej treść oferty pracy lub ogłoszenia rekrutacyjnego..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {/* INTERAKTYWNA GALERIA SZABLONÓW */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600 animate-pulse" /> Galeria Szablonów Dokumentu:
            </label>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold">
              Aktywny: {activeTemplate.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RESUME_TEMPLATES.map((tpl) => {
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
                  {/* Ptaszek zaznaczenia */}
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
                    <span>Zastosuj ten styl</span>
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
              Dołącz zdjęcie profilowe do wygenerowanego CV
              <span className="block text-[10px] text-slate-400 font-normal">
                {profile.personal.photo
                  ? "✓ Masz już wgrane zdjęcie profilowe w swoim profilu."
                  : "⚠ Uwaga: Aby zdjęcie się pojawiło, wgraj je najpierw w sekcji \"1. Twój Profil Kariery\"."}
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onGenerate(jobOffer, includePhoto, selectedTemplateId)}
            disabled={isGenerating || !jobOffer.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Optymalizowanie Twojego CV ({activeTemplate.name})...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 animate-bounce" /> Generuj Dopasowane CV przez AI
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
                <Info className="w-4 h-4 text-blue-500" /> Logika i Decyzje AI
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Oto wyjaśnienie, które sekcje Twojego profilu zostały wyeksponowane, a które wyciszone ze względu na dopasowanie (ATS):
              </p>

              <div className="space-y-3">
                {tailoredResume.tailoringDecisions.map((decision, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{decision.itemName}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                          decision.action.includes("Wyróżniono")
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : decision.action.includes("Pominięto")
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
                <FileText className="w-3.5 h-3.5" /> Podsumowanie zawodowe (Dopasowane)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{tailoredResume.professionalSummary}"
              </p>
            </div>
          </div>

          {/* Podgląd CV (Markdown) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between no-print bg-white rounded-xl border border-slate-100 p-4 gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-600 block">Podgląd gotowego dokumentu</span>
                <span className="text-[10px] text-slate-400 font-medium">Przełączaj szablon poniżej, aby zmienić styl w locie!</span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Selektor szablonu w locie */}
                <div className="flex items-center bg-slate-50 border border-slate-200 p-0.5 rounded-lg">
                  {RESUME_TEMPLATES.map((tpl) => (
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
                  {copied ? "Skopiowano!" : "Kopiuj"}
                </button>

                <button
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  title="Pobierz gotowy dokument jako plik PDF"
                >
                  {isExportingPdf ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Tworzenie PDF...</span>
                    </>
                  ) : pdfDownloaded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Pobrano PDF!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Drukuj / PDF</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="p-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-150 hidden sm:flex"
                  title="Wydrukuj bezpośrednio przez okno drukarki"
                >
                  <Printer className="w-4 h-4" />
                  <span>Drukarka</span>
                </button>
              </div>
            </div>

            {/* Pasek optymalizacji pod pełne strony A4 */}
            <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100/80 px-4 py-2.5 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Format A4:
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  measuredPages === 1 
                    ? "bg-emerald-100/80 text-emerald-800 border border-emerald-300/60" 
                    : "bg-blue-100/80 text-blue-800 border border-blue-300/60"
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {measuredPages === 1 ? "Idealnie 1 pełna strona A4" : `Pełne ${measuredPages} strony A4`}
                </span>
                {densityMode === "auto" && (
                  <span className="text-[10px] text-slate-500 hidden sm:inline-block">
                    (Auto-skalowanie aktywne)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-500 text-[11px] font-medium mr-1 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-slate-400" />
                  Rozmiar tekstu:
                </span>
                <div className="inline-flex bg-white border border-slate-200 p-0.5 rounded-lg shadow-2xs">
                  <button
                    onClick={() => setDensityMode("auto")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      densityMode === "auto"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Automatycznie dopasowuje czcionkę, by zmieścić CV na 1 stronie"
                  >
                    ⚡ Auto (1 str.)
                  </button>
                  <button
                    onClick={() => setDensityMode("compact")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      densityMode === "compact"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Mniejsza czcionka i zwięzłe odstępy"
                  >
                    Kompaktowa
                  </button>
                  <button
                    onClick={() => setDensityMode("ultracompact")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      densityMode === "ultracompact"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Ultra-zwarta czcionka dla długiego CV"
                  >
                    Ultra-zwarta
                  </button>
                  <button
                    onClick={() => setDensityMode("standard")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      densityMode === "standard"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Standardowa wielkość tekstu"
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setDensityMode("spacious")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      densityMode === "spacious"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Powiększona czcionka, by krótkie CV wypełniło całą stronę"
                  >
                    Powiększona
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
                  <span>Podgląd dokumentu</span>
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
                  <span>Edytuj treść (Markdown)</span>
                </button>
              </div>

              {activeTabMode === "preview" && (
                <button
                  type="button"
                  onClick={() => setActiveTabMode("edit")}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chcesz nanieść poprawki? Edytuj tekst</span>
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
                      <h3 className="text-sm font-bold text-slate-800">Edytor treści CV przed eksportem do PDF</h3>
                      <p className="text-[11px] text-slate-400">Możesz bezpośrednio zmodyfikować dowolne zdanie, sekcje lub dane przed wydrukiem lub pobraniem.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Czy chcesz przywrócić oryginalną treść wygenerowaną przez AI? Twoje ręczne edycje zostaną cofnięte.")) {
                          setEditedMarkdown(tailoredResume.tailoredResumeMarkdown);
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Cofnij do pierwotnej wersji wygenerowanej przez AI"
                    >
                      <Undo2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Przywróć wersję AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTabMode("preview")}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Zobacz podgląd</span>
                    </button>
                  </div>
                </div>

                {/* Narzędzia formatowania */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Formatuj:</span>
                  <button
                    type="button"
                    onClick={() => insertFormatting("**", "**", "pogrubiony tekst")}
                    className="p-1 px-2 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-xs font-bold cursor-pointer"
                    title="Pogrubienie (**tekst**)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("## ", "", "NAZWA SEKCJI")}
                    className="p-1 px-2 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-xs font-bold cursor-pointer flex items-center gap-1"
                    title="Nagłówek sekcji (## Tytuł)"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("- ", "", "Punkt listy")}
                    className="p-1 px-2 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-xs font-bold cursor-pointer flex items-center gap-1"
                    title="Punkt listy (- treść)"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("`", "`", "technologia")}
                    className="p-1 px-2 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-xs font-bold cursor-pointer flex items-center gap-1"
                    title="Tag technologii (`kod`)"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <div className="ml-auto text-[11px] text-slate-400">
                    {currentMarkdown.length} znaków • {currentMarkdown.trim().split(/\s+/).filter(Boolean).length} słów
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  value={editedMarkdown}
                  onChange={(e) => setEditedMarkdown(e.target.value)}
                  rows={20}
                  className="w-full font-mono text-xs leading-relaxed p-4 rounded-xl border border-slate-200 bg-slate-50/40 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
                  placeholder="Treść Twojego CV w formacie Markdown..."
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-1 gap-2">
                  <span>💡 Wszelkie zmiany zostaną natychmiast uwzględnione w podglądzie i wygenerowanym pliku PDF.</span>
                  <button
                    type="button"
                    onClick={() => setActiveTabMode("preview")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>Zatwierdź i przejdź do druku / PDF</span>
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
                    alt="Zdjęcie profilowe"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className={`markdown-body ${activeTemplate.styleClass} ${effectiveDensity}`}>
                <ReactMarkdown>{currentMarkdown}</ReactMarkdown>
              </div>

              {/* Informacja jeśli profil wykracza poza 1 stronę z szybkim przyciskiem zwężenia */}
              {measuredPages > 1 && (
                <div className="mt-8 pt-4 border-t-2 border-dashed border-amber-300 no-print flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-semibold text-amber-800 bg-amber-50/70 p-3 rounded-lg gap-2">
                  <span>⚠️ Dokument wykracza na stronę 2 A4. Włącz tryb „Ultra-zwarta”, aby zmieścić całość na 1 stronie.</span>
                  <button
                    onClick={() => setDensityMode("ultracompact")}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Zmniejsz czcionkę do 1 strony &rarr;
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
            <h3 className="text-sm font-semibold text-slate-800">Gemini modeluje Twoje CV</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Analizuję wymagania oferty i optymalizuję pod nie doświadczenie i umiejętności w stylu <strong className="text-blue-600">{activeTemplate.name}</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

