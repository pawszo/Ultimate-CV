import { useState, useEffect, useRef } from "react";
import { UserProfile, AIQuestion, AIConsensus, TailoredResume, Skill, DocumentInput } from "./types";
import { initialProfile } from "./defaultProfile";
import { PersonalDetailsForm } from "./components/PersonalDetailsForm";
import { ExperienceForm } from "./components/ExperienceForm";
import { EducationForm } from "./components/EducationForm";
import { SkillsForm } from "./components/SkillsForm";
import { LanguagesForm } from "./components/LanguagesForm";
import { AchievementsForm } from "./components/AchievementsForm";
import { DocInputForm } from "./components/DocInputForm";
import { AIAdvisor } from "./components/AIAdvisor";
import { TailoredResumeGenerator } from "./components/TailoredResumeGenerator";
import { PdfImportModal } from "./components/PdfImportModal";
import { 
  Sparkles, User, FileText, Lightbulb, ClipboardCopy, RefreshCw, 
  Layers, Sliders, AlertCircle, CheckCircle, Download, Upload, Shield, 
  X, LogOut, LogIn, Database, Settings, BookOpen, Briefcase, Award, PlusCircle,
  FolderOpen, Globe2
} from "lucide-react";
import { encryptProfile, decryptProfile } from "./utils/crypto";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { signInWithGoogle, logoutUser, saveProfileToCloud, loadProfileFromCloud, auth } from "./lib/firebase";

export default function App() {
  // Stan profilu kandydata, ładowany z localStorage lub predefiniowanych danych demo
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("digital_resume_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.languages) {
          parsed.languages = initialProfile.languages || [];
        }
        return parsed;
      } catch (e) {
        console.error("Błąd dekodowania profilu z localStorage", e);
      }
    }
    return initialProfile;
  });

  // Zakładka nawigacji
  const [activeTab, setActiveTab] = useState<"profile" | "docs" | "advisor" | "tailor">("profile");

  // Stan pytań pomocniczych AI
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Stan generowanego życiorysu pod konkretną ofertę
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);

  // Stan analizowania przesłanego dokumentu / linku
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);

  // Stany parsowania pliku PDF
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [parsedPdfData, setParsedPdfData] = useState<any | null>(null);
  const [showPdfImportModal, setShowPdfImportModal] = useState(false);

  // Statusy i komunikaty o błędach API
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Stan użytkownika Firebase i operacji chmurowych
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Dodatkowe stany UI dla okna powitalnego i szczegółów konta
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  
  // Ref dla inputu pliku (.cvp) ułatwiający programowe wywołanie
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subskrypcja stanu zalogowania Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setApiError(null);
    try {
      const loggedUser = await signInWithGoogle();
      showTemporarySuccess(`Zalogowano pomyślnie jako ${loggedUser.displayName || loggedUser.email}!`);
      
      // Po zalogowaniu sprawdzamy, czy użytkownik ma zapisany profil w chmurze
      const cloudProfile = await loadProfileFromCloud(loggedUser.uid);
      if (cloudProfile) {
        if (confirm(`Wykryto zapisany profil w chmurze Firebase dla użytkownika ${loggedUser.displayName || loggedUser.email}. Czy chcesz go teraz wczytać i zastąpić obecne dane lokalne?`)) {
          setProfile(cloudProfile);
          showTemporarySuccess("Pomyślnie wczytano stan profilu z chmury Firebase!");
        }
      }
    } catch (err: any) {
      console.error(err);
      setApiError("Błąd logowania przez Google. Jeśli jesteś w oknie podglądu (iframe), upewnij się, że zezwalasz na wyskakujące okienka (popups) lub otwórz aplikację w nowej karcie.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    setApiError(null);
    try {
      await logoutUser();
      showTemporarySuccess("Wylogowano pomyślnie.");
    } catch (err: any) {
      setApiError("Błąd podczas wylogowywania: " + err.message);
    }
  };

  const handleSaveToCloud = async () => {
    if (!user) return;
    setIsCloudSyncing(true);
    setApiError(null);
    try {
      await saveProfileToCloud(user.uid, profile);
      showTemporarySuccess("Kompletny stan Twojego profilu (wraz z analizami, wnioskami i załącznikami) został pomyślnie zapisany i zabezpieczony w chmurze Firebase!");
    } catch (err: any) {
      setApiError("Błąd zapisu w chmurze Firebase: " + err.message);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleLoadFromCloud = async () => {
    if (!user) return;
    if (!confirm("Czy na pewno chcesz pobrać stan z chmury? Twoje aktualne lokalne zmiany zostaną nadpisane.")) return;
    setIsCloudSyncing(true);
    setApiError(null);
    try {
      const cloudProfile = await loadProfileFromCloud(user.uid);
      if (cloudProfile) {
        setProfile(cloudProfile);
        showTemporarySuccess("Pomyślnie pobrano i wczytano stan profilu z chmury Firebase!");
      } else {
        setApiError("Brak zapisanego profilu w chmurze dla tego konta Google. Kliknij 'Zapisz w chmurze', aby zapisać obecny stan.");
      }
    } catch (err: any) {
      setApiError("Błąd odczytu z chmury Firebase: " + err.message);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Zapisywanie profilu do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem("digital_resume_profile", JSON.stringify(profile));
  }, [profile]);

  // Pobranie pytań od AI przy pierwszym załadowaniu
  useEffect(() => {
    loadAIQuestions();
  }, []);

  // Metoda wywołująca endpoint sugerowania pytań na podstawie aktualnego profilu
  const loadAIQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch("/api/gemini/suggest-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
          return;
        }
      }
      // Domyślne pytania w przypadku braku odpowiedzi z backendu
      setQuestions((prev) =>
        prev.length > 0
          ? prev
          : [
              {
                id: "q_default_1",
                field: "experience",
                question: "Jakie konkretne liczby, wskaźniki procentowe lub sukcesy najlepiej oddają efekty Twojej pracy na ostatnich stanowiskach?",
                tip: "Rekruterzy i menedżerowie poszukują dowodów na realny wpływ na biznes i projekty."
              },
              {
                id: "q_default_2",
                field: "skills",
                question: "Z jakimi kluczowymi narzędziami, metodykami lub technologiami pracujesz najchętniej?",
                tip: "Precyzyjne słowa kluczowe ułatwiają przejście przez selekcję systemów ATS."
              },
              {
                id: "q_default_3",
                field: "achievements",
                question: "Z jakiego trudnego projektu lub nieoczywistego problemu, który udało Ci się rozwiązać, jesteś najbardziej dumny?",
                tip: "Historie sukcesu w formule problem-działanie-efekt tworzą wyróżniający się profil kandydata."
              }
            ]
      );
    } catch (err: any) {
      console.warn("Informacja: Załadowano domyślne pytania doradcy kariery:", err?.message || err);
      setQuestions((prev) =>
        prev.length > 0
          ? prev
          : [
              {
                id: "q_default_1",
                field: "experience",
                question: "Jakie konkretne liczby, wskaźniki procentowe lub sukcesy najlepiej oddają efekty Twojej pracy na ostatnich stanowiskach?",
                tip: "Rekruterzy i menedżerowie poszukują dowodów na realny wpływ na biznes i projekty."
              },
              {
                id: "q_default_2",
                field: "skills",
                question: "Z jakimi kluczowymi narzędziami, metodykami lub technologiami pracujesz najchętniej?",
                tip: "Precyzyjne słowa kluczowe ułatwiają przejście przez selekcję systemów ATS."
              },
              {
                id: "q_default_3",
                field: "achievements",
                question: "Z jakiego trudnego projektu lub nieoczywistego problemu, który udało Ci się rozwiązać, jesteś najbardziej dumny?",
                tip: "Historie sukcesu w formule problem-działanie-efekt tworzą wyróżniający się profil kandydata."
              }
            ]
      );
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Dodanie dedukowanej umiejętności z wniosków AI do oficjalnego profilu
  const handleAddSkillFromConclusion = (skillName: string, category: string) => {
    // Sprawdzenie, czy już istnieje taka umiejętność
    const exists = profile.skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase());
    if (exists) {
      showTemporarySuccess(`Umiejętność "${skillName}" już znajduje się w Twoim profilu!`);
      return;
    }

    const newSkill: Skill = {
      id: "sk-auto-" + Date.now(),
      name: skillName,
      category: category,
      proficiency: "Średni",
    };

    setProfile({
      ...profile,
      skills: [...profile.skills, newSkill],
    });

    showTemporarySuccess(`Dodano umiejętność: "${skillName}" do sekcji "${category}"!`);
  };

  // Usuwanie pojedynczego wniosku z listy
  const handleDeleteConclusion = (indexToDelete: number) => {
    setProfile({
      ...profile,
      conclusions: profile.conclusions.filter((_, idx) => idx !== indexToDelete)
    });
  };

  // Obsługa analizy luźnego tekstu lub dokumentu i wyciągania z niego nowych faktów/wniosków
  const handleAnalyzeDocumentText = async (inputText: string) => {
    setIsAnalyzingDoc(true);
    setApiError(null);
    try {
      const response = await fetch("/api/gemini/draw-conclusions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentProfile: profile, inputText }),
      });

      if (!response.ok) {
        throw new Error("Błąd podczas wyciągania wniosków przez AI.");
      }

      const data = await response.json();
      
      // Integrujemy nowe wyekstrahowane wnioski (conclusions) oraz ewentualne suche fakty
      const newConclusions: AIConsensus[] = data.conclusions || [];
      const extracted = data.extractedFacts || {};

      let updatedSkills = [...profile.skills];
      if (extracted.skills && Array.isArray(extracted.skills)) {
        extracted.skills.forEach((skillName: string) => {
          if (!updatedSkills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
            updatedSkills.push({
              id: "sk-ext-" + Math.random(),
              name: skillName,
              category: "Umiejętności techniczne",
              proficiency: "Średni"
            });
          }
        });
      }

      setProfile(prev => ({
        ...prev,
        skills: updatedSkills,
        conclusions: [...newConclusions, ...prev.conclusions]
      }));

      showTemporarySuccess("AI przeanalizowało treść i zaktualizowało listę wniosków i umiejętności!");
      setActiveTab("advisor"); // Przenosimy użytkownika do doradcy, by zobaczył nowe wnioski!
    } catch (err: any) {
      console.error(err);
      setApiError("Błąd analizy tekstu. Upewnij się, że masz skonfigurowany klucz GEMINI_API_KEY.");
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  // Obsługa parsowania pliku PDF i wyciągania pełnych informacji o profilu
  const handleParsePdf = async (base64: string, fileName: string) => {
    setIsParsingPdf(true);
    setApiError(null);
    try {
      const response = await fetch("/api/gemini/parse-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Błąd podczas parsowania pliku PDF przez AI.");
      }

      const parsedData = await response.json();
      setParsedPdfData(parsedData);
      setShowPdfImportModal(true);

      // Automatycznie dodajemy wzmiankę o zaimportowanym pliku do historii dokumentów
      const docInput: DocumentInput = {
        id: "doc-pdf-" + Date.now(),
        title: `Zaimportowano: ${fileName}`,
        type: "document",
        content: `Dane automatycznie zaimportowane z pliku CV: ${fileName}. Wykryto ${parsedData.experience?.length || 0} stanowisk, ${parsedData.education?.length || 0} szkół, ${parsedData.skills?.length || 0} umiejętności.`,
        addedAt: new Date().toISOString().split("T")[0],
      };

      setProfile(prev => ({
        ...prev,
        documents: [docInput, ...prev.documents]
      }));

      showTemporarySuccess("Pomyślnie przeanalizowano plik PDF! Przejrzyj i wybierz dane do zaimportowania.");
    } catch (error: any) {
      console.error("Error parsing PDF:", error);
      setApiError("Błąd analizy PDF: " + (error.message || "Upewnij się, że plik nie jest uszkodzony i klucz API działa."));
    } finally {
      setIsParsingPdf(false);
    }
  };

  // Obsługa odpowiedzi na inteligentne pytanie pomocnicze
  const handleAnswerQuestion = async (q: AIQuestion, answerText: string) => {
    const newDoc: DocumentInput = {
      id: "doc-ans-" + Date.now(),
      title: `Odpowiedź na pytanie: "${q.question}"`,
      type: "text",
      content: answerText,
      addedAt: new Date().toISOString().split("T")[0]
    };

    // Dodajemy odpowiedź do dokumentów użytkownika
    setProfile(prev => ({
      ...prev,
      documents: [newDoc, ...prev.documents]
    }));

    // Szybko usuwamy to pytanie z listy dostępnych pytań, by użytkownik widział postęp
    setQuestions(prev => prev.filter(item => item.id !== q.id));

    // Automatycznie analizujemy odpowiedź, aby wyciągnąć ewentualne wnioski
    await handleAnalyzeDocumentText(`Pytanie: ${q.question}\nOdpowiedź: ${answerText}`);
  };

  // Obsługa dopasowywania i generowania CV na żądanie pod ofertę pracy
  const handleGenerateTailoredResume = async (jobOfferText: string, includePhoto: boolean, templateId: string) => {
    setIsGeneratingResume(true);
    setApiError(null);
    try {
      const response = await fetch("/api/gemini/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          conclusions: profile.conclusions,
          jobOffer: jobOfferText,
          includePhoto,
          templateId
        })
      });

      if (!response.ok) {
        throw new Error("Błąd podczas generowania dopasowanego CV.");
      }

      const data = await response.json();
      setTailoredResume(data);
      showTemporarySuccess("Pomyślnie wygenerowano CV perfekcyjnie dopasowane do oferty!");
    } catch (err: any) {
      console.error(err);
      setApiError("Nie udało się dopasować CV. Spróbuj ponownie lub sprawdź swój klucz API.");
    } finally {
      setIsGeneratingResume(false);
    }
  };

  // Reset do predefiniowanych danych demonstracyjnych (Jan Kowalski)
  const handleResetToDemo = () => {
    if (confirm("Czy na pewno chcesz przywrócić domyślne dane demonstracyjne? Wszystkie Twoje modyfikacje zostaną zastąpione.")) {
      setProfile(initialProfile);
      setTailoredResume(null);
      showTemporarySuccess("Przywrócono przykładowy profil zawodowy.");
    }
  };

  // Wyczyść profil (stwórz czysty szablon od zera)
  const handleClearProfile = () => {
    if (confirm("Czy na pewno chcesz wyczyścić cały profil i zacząć od zera?")) {
      setProfile({
        personal: { name: "", email: "", phone: "", website: "", linkedin: "", location: "", bio: "", photo: "" },
        experience: [],
        education: [],
        skills: [],
        languages: [],
        achievements: [],
        documents: [],
        conclusions: []
      });
      setTailoredResume(null);
      setQuestions([]);
      showTemporarySuccess("Wyczyszczono profil. Możesz teraz zacząć od zera!");
    }
  };

  // Pomocnicza metoda wyświetlająca tymczasowy komunikat sukcesu
  const showTemporarySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4500);
  };

  // Eksport zaszyfrowanej kopii zapasowej profilu (.cvp)
  const handleExportBackup = () => {
    try {
      const encryptedData = encryptProfile(profile);
      const blob = new Blob([encryptedData], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const cleanName = profile.personal.name.trim().replace(/\s+/g, "_") || "kandydat";
      link.href = url;
      link.download = `profil_${cleanName}_backup.cvp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showTemporarySuccess("Pomyślnie wyeksportowano bezpieczną, zaszyfrowaną kopię zapasową (.cvp)!");
    } catch (err: any) {
      setApiError("Błąd podczas eksportowania profilu: " + err.message);
    }
  };

  // Import zaszyfrowanej kopii zapasowej profilu (.cvp)
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const decryptedProfile = decryptProfile(text);
        if (decryptedProfile) {
          setProfile(decryptedProfile);
          setShowOnboarding(false); // Zamknij powitalne okno po udanym imporcie
          showTemporarySuccess("Pomyślnie odszyfrowano i zaimportowano profil z pliku kopii zapasowej (.cvp)!");
        }
      } catch (err: any) {
        setApiError("Nie udało się odczytać pliku kopii zapasowej: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset inputu
  };

  // Obsługa akcji z okna powitalnego
  const handleOnboardingNewResume = () => {
    setProfile({
      personal: { name: "", email: "", phone: "", website: "", linkedin: "", location: "", bio: "", photo: "" },
      experience: [],
      education: [],
      skills: [],
      languages: [],
      achievements: [],
      documents: [],
      conclusions: []
    });
    setShowOnboarding(false);
    showTemporarySuccess("Rozpoczęto tworzenie nowego profilu CV od zera!");
  };

  const handleOnboardingLoginAndLoad = async () => {
    setIsLoggingIn(true);
    setApiError(null);
    try {
      const loggedUser = await signInWithGoogle();
      showTemporarySuccess(`Zalogowano pomyślnie jako ${loggedUser.displayName || loggedUser.email}!`);
      
      const cloudProfile = await loadProfileFromCloud(loggedUser.uid);
      if (cloudProfile) {
        setProfile(cloudProfile);
        setShowOnboarding(false);
        showTemporarySuccess("Pomyślnie pobrano i wczytano stan profilu z chmury Firebase!");
      } else {
        setShowOnboarding(false);
        showTemporarySuccess("Zalogowano pomyślnie! Rozpoczynasz z nowym profilem (brak zapisanego stanu w chmurze).");
      }
    } catch (err: any) {
      console.error(err);
      setApiError("Błąd logowania przez Google. Otwórz aplikację w nowej karcie (podgląd iframe może blokować popupy).");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      
      {/* UKRYTY GLOBALNY INPUT DLA PLIKÓW KOPII ZAPASOWEJ (.CVP) */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".cvp"
        onChange={handleImportBackup}
        className="hidden"
      />

      {/* UNIKALNY, ELEGANCKI HEADER APLIKACJI - no-print */}
      <header className="no-print bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-800 tracking-tight font-display">
                Cyfrowy Kreator CV
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold">
                Inteligentny Asystent Kariery & AI Generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Przycisk szczegółów konta (Moje Dane i Statystyki) */}
            <button
              onClick={() => setShowAccountDetails(true)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-150 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Zobacz szczegóły swojego konta, statystyki profilu i opcje synchronizacji"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500 animate-spin-slow" />
              <span className="hidden sm:inline">Szczegóły konta</span>
              <span className="sm:hidden">Konto</span>
            </button>

            {/* Panel logowania bezpośrednio w głównym pasku */}
            {user ? (
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => setShowAccountDetails(true)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="" 
                      className="w-4.5 h-4.5 rounded-full border border-white" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700">
                      U
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-slate-700 max-w-[100px] truncate hidden md:inline">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleGoogleLogout}
                  className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Wyloguj się"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isLoggingIn ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
                <span>Zaloguj przez Google</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ALERT BOX - błędy i sukcesy API */}
      {successMsg && (
        <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-xs text-xs font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {apiError && (
        <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="bg-rose-50 border border-rose-150 text-rose-800 px-4 py-3 rounded-xl flex items-start gap-2.5 shadow-xs text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Błąd Integracji AI / Systemu:</p>
              <p className="text-[11px] text-rose-700 mt-0.5">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* OKNO POWITALNE (ONBOARDING) - PO URUCHOMIENIU APLIKACJI */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 p-6 text-white text-center relative">
              <div className="mx-auto w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold font-display">Cyfrowy Kreator CV</h2>
              <p className="text-xs text-indigo-200/80 mt-1">Inteligentny generator CV ze wsparciem Gemini AI</p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 text-center">
                Wybierz jedną z poniższych opcji, aby rozpocząć pracę ze swoim życiorysem:
              </p>

              {/* Opcja 1: Nowe CV */}
              <button
                onClick={handleOnboardingNewResume}
                className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-xl text-left transition-all flex items-start gap-3.5 group cursor-pointer"
              >
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Stwórz nowe CV</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Rozpocznij wypełnianie pustego profilu kariery krok po kroku.</p>
                </div>
              </button>

              {/* Opcja 2: Wczytaj z pliku */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition-all flex items-start gap-3.5 group cursor-pointer"
              >
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:scale-105 transition-transform">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Wczytaj dane z pliku kopii</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Wczytaj wcześniej pobrany, bezpiecznie zaszyfrowany plik .cvp.</p>
                </div>
              </button>

              {/* Opcja 3: Logowanie Firebase */}
              <button
                onClick={handleOnboardingLoginAndLoad}
                disabled={isLoggingIn}
                className="w-full p-3.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all flex items-start gap-3.5 group cursor-pointer disabled:opacity-50"
              >
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:scale-105 transition-transform flex items-center justify-center">
                  {isLoggingIn ? (
                    <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  ) : (
                    <Database className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Zaloguj się i pobierz z Chmury
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Połącz konto Google z Firebase i pobierz swój zapisany stan.</p>
                </div>
              </button>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setShowOnboarding(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold transition-colors cursor-pointer"
              >
                Pomiń (kontynuuj z obecnymi danymi)
              </button>
              <span className="text-[10px] text-slate-300 font-medium">v1.1 Bezpieczna Kopia</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SZCZEGÓŁY KONTA, STATYSTYKI I OPERACJE SYNCHRONIZACJI */}
      {showAccountDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header modalu */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm font-display">Szczegóły Konta & Synchronizacja</h3>
              </div>
              <button
                onClick={() => setShowAccountDetails(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Sekcja Profilu użytkownika */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-3">Tożsamość</h4>
                {user ? (
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-11 h-11 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-11 h-11 bg-indigo-600 text-white flex items-center justify-center rounded-full text-base font-bold">
                        {user.displayName?.[0] || user.email?.[0] || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-800">{user.displayName || "Użytkownik"}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{user.email}</p>
                      <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full mt-1.5">
                        <Database className="w-2.5 h-2.5" /> Połączono z Firebase Cloud
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-slate-500">Pracujesz obecnie w trybie całkowicie lokalnym (offline).</p>
                    <p className="text-[11px] text-slate-400 mt-1">Zaloguj się przez Google, aby synchronizować dane na różnych urządzeniach i zapobiec ich utracie.</p>
                    <button
                      onClick={() => {
                        setShowAccountDetails(false);
                        handleGoogleLogin();
                      }}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Zaloguj przez Google
                    </button>
                  </div>
                )}
              </div>

              {/* Sekcja Statystyk Danych */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-3">Zawartość Twojego Profilu</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white border border-slate-150 rounded-xl flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[11px] text-slate-400">Doświadczenie</span>
                      <strong className="text-slate-800 font-bold">{profile.experience.length} pozycji</strong>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-150 rounded-xl flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[11px] text-slate-400">Edukacja</span>
                      <strong className="text-slate-800 font-bold">{profile.education.length} wpisy</strong>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-150 rounded-xl flex items-center gap-2.5">
                    <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[11px] text-slate-400">Umiejętności</span>
                      <strong className="text-slate-800 font-bold">{profile.skills.length} pozycji</strong>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-150 rounded-xl flex items-center gap-2.5">
                    <Globe2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[11px] text-slate-400">Języki obce</span>
                      <strong className="text-slate-800 font-bold">{profile.languages?.length || 0} języków</strong>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-150 rounded-xl flex items-center gap-2.5 col-span-2">
                    <Award className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[11px] text-slate-400">Osiągnięcia</span>
                      <strong className="text-slate-800 font-bold">{profile.achievements.length} nagrody</strong>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-150 rounded-xl flex items-center gap-2.5 col-span-2">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[11px] text-slate-400">Analizy, wnioski i skany załączników</span>
                      <strong className="text-slate-800 font-bold">
                        {profile.documents?.length || 0} załączników, {profile.conclusions?.length || 0} wniosków AI
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sekcja Operacji Bezpieczeństwa */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-3">Operacje Bezpieczeństwa & Pliki</h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportBackup}
                      className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      Eksportuj do .cvp
                    </button>
                    <button
                      onClick={() => {
                        setShowAccountDetails(false);
                        fileInputRef.current?.click();
                      }}
                      className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      Wczytaj z .cvp
                    </button>
                  </div>

                  {user && (
                    <div className="flex gap-2 pt-1 border-t border-slate-100 mt-2">
                      <button
                        onClick={handleSaveToCloud}
                        disabled={isCloudSyncing}
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Database className="w-3.5 h-3.5" />
                        Zapisz w chmurze
                      </button>
                      <button
                        onClick={handleLoadFromCloud}
                        disabled={isCloudSyncing}
                        className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Wczytaj z chmury
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        if (confirm("Czy przywrócić wbudowane dane demonstracyjne? Twoje obecne zmiany zostaną utracone.")) {
                          handleResetToDemo();
                          setShowAccountDetails(false);
                        }
                      }}
                      className="flex-1 py-1.5 text-[11px] text-slate-500 hover:text-slate-800 font-medium hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Zresetuj do demo
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Czy na pewno chcesz całkowicie wyczyścić profil kariery? Operacja usunie wszystkie dane.")) {
                          handleClearProfile();
                          setShowAccountDetails(false);
                        }
                      }}
                      className="flex-1 py-1.5 text-[11px] text-rose-500 hover:text-rose-700 font-medium hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Wyczyść wszystko
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowAccountDetails(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GŁÓWNA TREŚĆ - ze zwiększonym paddingiem dolnym pod navigation bar */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 w-full">
        {/* ZAKŁADKA 1: MÓJ PROFIL */}
        {activeTab === "profile" && (
          <div className="no-print space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <PersonalDetailsForm
                  data={profile.personal}
                  onChange={(personal) => setProfile({ ...profile, personal })}
                />
                <LanguagesForm
                  data={profile.languages || []}
                  onChange={(languages) => setProfile({ ...profile, languages })}
                />
                <SkillsForm
                  data={profile.skills}
                  onChange={(skills) => setProfile({ ...profile, skills })}
                />
              </div>
              <div className="space-y-6">
                <ExperienceForm
                  data={profile.experience}
                  onChange={(experience) => setProfile({ ...profile, experience })}
                />
                <EducationForm
                  data={profile.education}
                  onChange={(education) => setProfile({ ...profile, education })}
                />
                <AchievementsForm
                  data={profile.achievements}
                  onChange={(achievements) => setProfile({ ...profile, achievements })}
                />
              </div>
            </div>
          </div>
        )}

        {/* ZAKŁADKA 2: DOKUMENTY I REFERENCJE */}
        {activeTab === "docs" && (
          <div className="no-print">
            <DocInputForm
              data={profile.documents}
              onChange={(documents) => setProfile({ ...profile, documents })}
              onAnalyze={handleAnalyzeDocumentText}
              isAnalyzing={isAnalyzingDoc}
              onParsePdf={handleParsePdf}
              isParsingPdf={isParsingPdf}
            />
          </div>
        )}

        {/* ZAKŁADKA 3: INTELIGENTNE WNIOSKI I PYTANIA */}
        {activeTab === "advisor" && (
          <div className="no-print">
            <AIAdvisor
              questions={questions}
              conclusions={profile.conclusions}
              onAddSkill={handleAddSkillFromConclusion}
              onAnswerQuestion={handleAnswerQuestion}
              isLoadingQuestions={isLoadingQuestions}
              onRefreshQuestions={loadAIQuestions}
              onDeleteConclusion={handleDeleteConclusion}
            />
          </div>
        )}

        {/* ZAKŁADKA 4: GENEROWANIE ADAPTACYJNEGO CV */}
        {activeTab === "tailor" && (
          <div className="space-y-6">
            <TailoredResumeGenerator
              profile={profile}
              onGenerate={handleGenerateTailoredResume}
              tailoredResume={tailoredResume}
              isGenerating={isGeneratingResume}
            />
          </div>
        )}
      </main>

      {/* MODAL IMPORTU DANYCH Z PDF */}
      <PdfImportModal
        isOpen={showPdfImportModal}
        onClose={() => setShowPdfImportModal(false)}
        parsedData={parsedPdfData}
        currentProfile={profile}
        onApply={(updatedProfile) => {
          setProfile(updatedProfile);
          showTemporarySuccess("Pomyślnie scalono i zaimportowano wybrane dane z Twojego CV PDF!");
        }}
      />

      {/* STOPKA - ukrywana podczas drukowania */}
      <footer className="no-print bg-white border-t border-slate-100 py-6 mt-12 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-1">
          <p className="text-xs text-slate-400 font-medium">Cyfrowy Kreator CV • Wspierany przez Gemini Flash</p>
          <p className="text-[10px] text-slate-300">Projekt wspierany przez doradców kariery. Wszystkie Twoje dane są zapisywane lokalnie i w zabezpieczonej chmurze.</p>
        </div>
      </footer>

      {/* DOLNY TAB VIEW / NAVIGACJA - no-print */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-250 shadow-2xl z-45 no-print pb-1 sm:pb-2">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <nav className="flex justify-around items-center h-16">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-3 text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "text-blue-600 scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <User className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === "profile" ? "scale-110 text-blue-600" : "text-slate-400"}`} />
              <span className="hidden xs:inline">1. Profil Kariery</span>
              <span className="xs:hidden">Profil</span>
            </button>

            <button
              onClick={() => setActiveTab("docs")}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-3 text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeTab === "docs"
                  ? "text-blue-600 scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <FileText className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === "docs" ? "scale-110 text-blue-600" : "text-slate-400"}`} />
              <span className="hidden xs:inline">2. Skaner i Dokumenty</span>
              <span className="xs:hidden">Dokumenty</span>
            </button>

            <button
              onClick={() => setActiveTab("advisor")}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-3 text-[10px] sm:text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === "advisor"
                  ? "text-blue-600 scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className="relative">
                <Lightbulb className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === "advisor" ? "scale-110 text-amber-500" : "text-slate-400"}`} />
                {profile.conclusions.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {profile.conclusions.length}
                  </span>
                )}
              </div>
              <span className="hidden xs:inline">3. Doradca AI i Wnioski</span>
              <span className="xs:hidden">Doradca AI</span>
            </button>

            <button
              onClick={() => setActiveTab("tailor")}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-3 text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeTab === "tailor"
                  ? "text-blue-600 scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Sparkles className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === "tailor" ? "scale-110 text-indigo-500" : "text-slate-400"}`} />
              <span className="hidden xs:inline">4. Dopasuj pod Ofertę</span>
              <span className="xs:hidden">Dopasuj</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
