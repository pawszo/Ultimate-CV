import React, { useState, useRef } from "react";
import { DocumentInput } from "../types";
import { FileText, Link as LinkIcon, Plus, Trash2, Calendar, Sparkles, UploadCloud, FileUp } from "lucide-react";

interface Props {
  data: DocumentInput[];
  onChange: (data: DocumentInput[]) => void;
  onAnalyze: (text: string) => Promise<void>;
  isAnalyzing: boolean;
  onParsePdf: (base64: string, fileName: string) => Promise<void>;
  isParsingPdf: boolean;
}

export const DocInputForm: React.FC<Props> = ({ 
  data, 
  onChange, 
  onAnalyze, 
  isAnalyzing,
  onParsePdf,
  isParsingPdf
}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentInput["type"]>("text");
  const [content, setContent] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Obsługiwane są wyłącznie pliki PDF.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        await onParsePdf(base64, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleAddAndAnalyze = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Tytuł oraz treść/link są wymagane do analizy.");
      return;
    }

    const created: DocumentInput = {
      id: "doc-" + Date.now(),
      title: title.trim(),
      type,
      content: content.trim(),
      addedAt: new Date().toISOString().split("T")[0],
    };

    onChange([created, ...data]);
    
    // Automatycznie analizuj nowo dodany tekst/link
    await onAnalyze(content.trim());
    
    setTitle("");
    setContent("");
  };

  const handleDelete = (id: string) => {
    onChange(data.filter((d) => d.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 font-display">Skaner i Notatki (Dokumenty)</h2>
            <p className="text-xs text-slate-400">Dodaj referencje, notatki, linki lub całe opisy prac</p>
          </div>
        </div>
      </div>

      {/* SEKCJA IMPORTU PDF (Skaner CV) */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all duration-200 text-center relative group ${
          isDragOver 
            ? "border-blue-500 bg-blue-50/30 shadow-xs scale-[1.01]" 
            : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 bg-white"
        }`}
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            {isParsingPdf ? (
              <div className="w-6 h-6 border-3 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6 animate-bounce" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-850">Inteligentny Skaner CV (Import z pliku PDF)</h3>
            <p className="text-xs text-slate-400">
              Przeciągnij i upuść plik PDF ze swoim dotychczasowym CV lub <span onClick={() => fileInputRef.current?.click()} className="text-blue-600 hover:text-blue-700 font-semibold underline cursor-pointer">wybierz go z dysku</span>
            </p>
            <p className="text-[10px] text-slate-400">Model Gemini Flash przeanalizuje plik i zaproponuje automatyczne uzupełnienie sekcji Twojego profilu zawodowego.</p>
          </div>

          {isParsingPdf ? (
            <div className="py-2 space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> Analizowanie pliku PDF przez Gemini Flash...
              </span>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <FileUp className="w-3.5 h-3.5" /> Wybierz plik PDF
            </button>
          )}
        </div>
      </div>

      {/* Szybkie dodawanie i analiza */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Analizator Treści AI
          </h3>
          <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-semibold">
            Automatyczne Wnioski
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Tytuł / źródło (np. Opinia szefa, Link do LinkedIn)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white md:col-span-2"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DocumentInput["type"])}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
          >
            <option value="text">Notatki / Luźny Tekst</option>
            <option value="link">Link internetowy (np. LinkedIn)</option>
            <option value="document">Dokument / Referencje</option>
          </select>
        </div>

        <textarea
          placeholder={
            type === "link"
              ? "Wklej link lub treść z danej strony internetowej, z której chcesz wyciągnąć wnioski..."
              : "Wklej tutaj tekst referencji, listę zadań, skopiowany profil, CV, luźne myśli o Twojej karierze, a AI wyciągnie z nich ukryte wnioski, umiejętności i doda do Twojej bazy wiedzy."
          }
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-rose-500/20"
        />

        <div className="flex justify-end">
          <button
            onClick={handleAddAndAnalyze}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analizowanie treści...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Dodaj i Wyciągnij Wnioski
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lista historii dodanych dokumentów */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Twoje Dodane Dokumenty ({data.length})</h3>
        {data.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-4">Brak powiązanych dokumentów lub luźnego tekstu.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.map((doc) => (
              <div key={doc.id} className="p-4 bg-slate-50/20 border border-slate-100 rounded-xl relative group">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg mt-0.5">
                    {doc.type === "link" ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="space-y-1 pr-6">
                    <h4 className="text-xs font-bold text-slate-700 truncate">{doc.title}</h4>
                    <p className="text-[9px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {doc.addedAt}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-3 mt-1.5 italic bg-white/50 p-1.5 rounded-md border border-slate-50">
                      "{doc.content}"
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="absolute top-3 right-3 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Usuń"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
