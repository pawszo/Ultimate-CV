import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Leniwa inicjalizacja klienta Gemini w celu zapobieżenia awarii przy braku klucza podczas uruchamiania
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) {
      throw new Error("Brak klucza API (GEMINI_API_KEY). Skonfiguruj go w panelu Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Funkcja pomocnicza do bezpiecznego parsowania odpowiedzi JSON z modeli Gemini
function cleanAndParseJson<T>(rawText: string | undefined | null, defaultValue: T): T {
  if (!rawText) return defaultValue;
  let text = rawText.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return defaultValue;
  }
}

// Funkcja wywołująca Gemini z modelem flash-lite i automatycznym rezerwowym modelem
async function generateWithFallback(ai: GoogleGenAI, config: any) {
  try {
    return await ai.models.generateContent({
      ...config,
      model: "gemini-3.1-flash-lite",
    });
  } catch (err: any) {
    const isQuota = err?.message?.includes("429") || err?.message?.includes("quota") || err?.status === "RESOURCE_EXHAUSTED";
    if (isQuota) {
      try {
        return await ai.models.generateContent({
          ...config,
          model: "gemini-3.8-flash",
        });
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }
    throw err;
  }
}

// Podręczny cache dla pytań pomocniczych, by nie odpytywać API przy każdym kliknięciu
const questionsCache = new Map<string, { timestamp: number; questions: any[] }>();

// Inteligentne pytania pomocnicze dopasowane do stopnia uzupełnienia profilu (fallback)
function getDefaultQuestions(profile: any) {
  const questions: Array<{ id: string; field: string; question: string; tip: string }> = [];
  const expCount = profile?.experience?.length || 0;
  const skillsCount = profile?.skills?.length || 0;
  const achCount = profile?.achievements?.length || 0;
  const hasBio = Boolean(profile?.personal?.bio && profile.personal.bio.trim().length > 30);

  if (expCount === 0) {
    questions.push({
      id: "q-exp-missing",
      field: "experience",
      question: "W jakich firmach, rolach lub projektach (komercyjnych, akademickich, open-source) zdobywałeś dotychczasowe doświadczenie?",
      tip: "Nawet praktyki, staże czy projekty studenckie demonstrują Twoją proaktywność i umiejętności praktyczne."
    });
  } else {
    questions.push({
      id: "q-exp-metrics",
      field: "experience",
      question: "Jakie konkretne liczby, wskaźniki procentowe lub sukcesy (np. wzrost wydajności, zaoszczędzony czas, budżet) najlepiej oddają rezultaty Twojej pracy?",
      tip: "Mierzalne sukcesy i liczby w CV natychmiast przyciągają uwagę rekruterów i dowodzą realnego wpływu na biznes."
    });
  }

  if (skillsCount < 4) {
    questions.push({
      id: "q-skills-tools",
      field: "skills",
      question: "Z jakich specjalistycznych narzędzi, języków programowania, bibliotek lub programów korzystasz w codziennej pracy?",
      tip: "Dokładne słowa kluczowe w sekcji umiejętności pomagają systemom ATS zakwalifikować Twój profil."
    });
  }

  if (achCount === 0) {
    questions.push({
      id: "q-ach-cert",
      field: "achievements",
      question: "Czy posiadasz certyfikaty branżowe, ukończone kursy specjalistyczne lub nagrody, którymi warto wzbogacić CV?",
      tip: "Certyfikaty są niezależnym potwierdzeniem Twojej wiedzy i motywacji do nieustannego rozwoju."
    });
  }

  if (!hasBio) {
    questions.push({
      id: "q-personal-bio",
      field: "personal",
      question: "Jak w 2-3 zwięzłych zdaniach opisałbyś swój profil zawodowy i kluczowy cel kolejnego etapu kariery?",
      tip: "Krótkie podsumowanie zawodowe (bio) na samej górze CV pozwala rekruterowi w kilka sekund zrozumieć, kim jesteś."
    });
  }

  if (questions.length < 3) {
    questions.push({
      id: "q-lang-soft",
      field: "skills",
      question: "Jakie języki obce znasz i w jakim stopniu czujesz się swobodnie w komunikacji zawodowej?",
      tip: "Biegłość w językach obcych (np. angielski B2/C1) to kluczowy atut w większości procesów rekrutacyjnych."
    });
  }

  return questions;
}

// 1. Sugerowanie inteligentnych pytań na podstawie profilu
app.post("/api/gemini/suggest-questions", async (req, res) => {
  const { profile } = req.body || {};

  // Sprawdzenie cache
  const cacheKey = JSON.stringify({
    name: profile?.personal?.name,
    expCount: profile?.experience?.length || 0,
    skillsCount: profile?.skills?.length || 0,
    achCount: profile?.achievements?.length || 0
  });

  const cached = questionsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 120000) {
    return res.json({ questions: cached.questions });
  }

  try {
    const ai = getGeminiClient();

    // Kompaktowy profil do promptu, by nie marnować tokenów
    const compactProfile = {
      name: profile?.personal?.name,
      location: profile?.personal?.location,
      bio: profile?.personal?.bio,
      roles: (profile?.experience || []).map((e: any) => `${e.role} @ ${e.company}`),
      skills: (profile?.skills || []).map((s: any) => s.name),
      education: (profile?.education || []).map((ed: any) => `${ed.degree} ${ed.fieldOfStudy}`),
      achievements: (profile?.achievements || []).map((a: any) => a.title)
    };

    const prompt = `Analizujesz profil zawodowy użytkownika w celu wygenerowania 3-4 spersonalizowanych, inteligentnych pytań i praktycznych wskazówek, które pomogą mu uzupełnić luki w życiorysie zawodowym.
Oto aktualne dane profilu:
${JSON.stringify(compactProfile, null, 2)}

Wygeneruj pytania i wskazówki w języku polskim. Jeśli profil jest prawie pusty, zadaj pytania ogólne, ale profesjonalne (np. o najważniejsze kierunki kariery, pasje, kluczowe projekty). Jeśli zawiera doświadczenia, dopytaj o szczegóły, technologie, sukcesy, miary sukcesu (np. liczby, procenty) lub brakujące sekcje (np. certyfikaty, języki, wykształcenie).`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "Jesteś ekspertem rekrutacji i doradcą kariery. Twoim celem jest zadawanie głębokich, konstruktywnych pytań, które pomogą użytkownikowi stworzyć nieskazitelny profil zawodowy.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  field: { type: Type.STRING, description: "Jakiej sekcji profilu dotyczy pytanie (np. 'experience', 'skills', 'achievements', 'personal', 'education')" },
                  question: { type: Type.STRING, description: "Konkretne, profesjonalne pytanie po polsku" },
                  tip: { type: Type.STRING, description: "Wskazówka dlaczego to pytanie jest ważne i jak na nie odpowiedzieć (np. 'Podanie konkretnych liczb przyciąga wzrok rekruterów')" }
                },
                required: ["id", "field", "question", "tip"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const parsed = cleanAndParseJson(response.text, { questions: [] });
    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      questionsCache.set(cacheKey, { timestamp: Date.now(), questions: parsed.questions });
      return res.json(parsed);
    }
    const defaultQs = getDefaultQuestions(profile);
    questionsCache.set(cacheKey, { timestamp: Date.now(), questions: defaultQs });
    return res.json({ questions: defaultQs });
  } catch (error: any) {
    console.log("[Doradca AI] suggest-questions: zastosowano domyślny zestaw pytań");
    const defaultQs = getDefaultQuestions(profile);
    questionsCache.set(cacheKey, { timestamp: Date.now(), questions: defaultQs });
    return res.json({
      questions: defaultQs
    });
  }
});

// 2. Wyciąganie wniosków i faktów z tekstu/dokumentu/linku
app.post("/api/gemini/draw-conclusions", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { currentProfile, inputText } = req.body;

    const prompt = `Przeanalizuj poniższy tekst wejściowy (może to być opis stanowiska, skopiowany dokument, link z treścią lub luźne notatki użytkownika) i stwórz na jego podstawie inteligentne wnioski (conclusions) oraz wyciągnij konkretne suche fakty (faktoring doświadczenia, umiejętności, edukacji), aby rozbudować profil zawodowy.

REGUŁA WYCIĄGANIA WNIOSKÓW (Inteligentna dedukcja):
- Jeśli użytkownik podaje doświadczenie jako programista/developer, automatycznie wyciągnij wniosek, że posiada wysokie zdolności analityczne, umiejętność rozwiązywania problemów (problem solving) oraz biegłość komputerową (computer literacy).
- Jeśli użytkownik podaje doświadczenie jako kucharz, wyciągnij wniosek, że posiada doskonałą znajomość różnorodnych składników, zasad higieny (HACCP), obsługi profesjonalnego sprzętu kuchennego oraz pracy pod presją czasu.
- Dla każdego innego zawodu lub opisu, dokonaj podobnej, logicznej i wartościowej dedukcji dotyczącej ukrytych umiejętności miękkich, twardych lub cech charakteru, które naturalnie wynikają z danej roli.

Oto aktualny profil użytkownika:
${JSON.stringify(currentProfile, null, 2)}

Oto nowy tekst/dokument do analizy:
---
${inputText}
---

Wygeneruj wnioski i wyekstrahowane fakty w języku polskim.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "Jesteś inteligentnym systemem analizującym karierę zawodową. Potrafisz czytać między wierszami i dedukować ukryte kompetencje, umiejętności i predyspozycje na podstawie podanych doświadczeń i opisów.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conclusions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "Kategoria wniosku (np. 'umiejętność miękka', 'umiejętność twarda', 'cecha', 'wiedza dziedzinowa')" },
                  title: { type: Type.STRING, description: "Nazwa wnioskowanej kompetencji (np. 'Myślenie analityczne', 'Dbałość o standardy HACCP', 'Praca zespołowa')" },
                  explanation: { type: Type.STRING, description: "Jasne, profesjonalne uzasadnienie po polsku (np. 'Z racji Twojej pracy jako programista, analityczne myślenie i rozwiązywanie problemów są kluczowym elementem Twojego warsztatu.')" },
                  confidence: { type: Type.STRING, description: "Poziom pewności dedukcji (np. 'wysoki', 'średni')" }
                },
                required: ["type", "title", "explanation", "confidence"]
              }
            },
            extractedFacts: {
              type: Type.OBJECT,
              properties: {
                skills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Lista konkretnych słów kluczowych umiejętności wyciągniętych z tekstu"
                },
                experiences: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      role: { type: Type.STRING },
                      company: { type: Type.STRING },
                      period: { type: Type.STRING, description: "Okres zatrudnienia, np. '2021 - 2023'" },
                      description: { type: Type.STRING, description: "Krótki, profesjonalny opis obowiązków wyciągnięty z tekstu" }
                    },
                    required: ["role", "company"]
                  }
                },
                education: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Wyciągnięte fakty o edukacji lub szkoleniach"
                }
              }
            }
          },
          required: ["conclusions"]
        }
      }
    });

    const parsed = cleanAndParseJson(response.text, { conclusions: [], extractedFacts: { skills: [], experiences: [], education: [] } });
    res.json(parsed);
  } catch (error: any) {
    console.log("[Doradca AI] draw-conclusions: chwilowy problem lub limit");
    const isQuota = error?.message?.includes("429") || error?.message?.includes("quota") || error?.status === "RESOURCE_EXHAUSTED";
    const msg = isQuota 
      ? "Chwilowo przekroczono limit zapytań darmowego API. Odczekaj kilkanaście sekund i spróbuj ponownie." 
      : "Wystąpił problem podczas analizy tekstu. Spróbuj ponownie za chwilę.";
    res.status(500).json({ error: msg });
  }
});

// 3. Generowanie spersonalizowanego CV pod konkretną ofertę pracy
app.post("/api/gemini/generate-resume", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { profile, conclusions, jobOffer, includePhoto, templateId = "classic" } = req.body;

    let templateInstruction = "Zastosuj styl tradycyjny, konserwatywny, formalny i zrównoważony. Nie używaj żadnych emoji ani emotikonów. Sformatuj sekcje w klasycznej, jednokolumnowej strukturze z wyraźnym podziałem na nagłówki.";
    if (templateId === "modern") {
      templateInstruction = "Zastosuj styl nowoczesny i minimalistyczny. Struktura powinna być przestronna, zwięzła i przejrzysta. Skoncentruj się na silnych słowach kluczowych i krótkich, uderzających wypunktowaniach. Używaj oszczędnego formatowania.";
    } else if (templateId === "tech") {
      templateInstruction = `Zastosuj nowoczesny, czysty i profesjonalny styl IT / Inżynieria (Software & DevOps):
- BEZWZGLĘDNIE NIE UŻYWAJ żadnych ukośników '//' ani pseudo-terminalowych ozdobników w nagłówkach! Używaj czystych, eleganckich nagłówków H2 pisanych wielkimi literami, np. '## UMIEJĘTNOŚCI TECHNICZNE', '## DOŚWIADCZENIE ZAWODOWE', '## PROJEKTY INŻYNIERSKIE', '## JĘZYKI OBCE', '## EDUKACJA I CERTYFIKATY'.
- Nagłówek: Imię i nazwisko jako H1, pod spodem docelowa rola inżynierska (np. Senior Frontend Developer / Full Stack Engineer), a dane kontaktowe w estetycznej linii z separatorami (np. email • github • linkedin • telefon • miasto).
- W sekcji umiejętności technicznych pogrupuj technologie logicznie (Języki programowania, Frameworki & Biblioteki, Bazy danych & Chmura, Narzędzia).
- Każdą technologię, bibliotekę, framework, bazę danych i narzędzie oznaczaj w znacznikach kodu markdown (np. \`React\`, \`TypeScript\`, \`Node.js\`, \`Docker\`, \`PostgreSQL\`, \`AWS\`), co utworzy estetyczne tagi.
- W punktach doświadczenia stosuj inżynierską formułę: [Działanie] + [Użyta technologia] + [Mierzalny rezultat / Wpływ na produkt], np. 'Wdrożono architekturę komponentów w \`React\` i \`TypeScript\`, skracając czas ładowania strony o 35%'.`;
    } else if (templateId === "creative") {
      templateInstruction = "Zastosuj styl kreatywny i dynamiczny. Możesz użyć nielicznych, nowoczesnych i profesjonalnych ikon/emotikonów jako punktorów przy sekcjach. Wstęp (podsumowanie zawodowe) sformatuj w bardzo chwytliwy i nieszablonowy sposób, aby od razu przykuć uwagę rekrutera.";
    }

    const prompt = `Jako profesjonalny rekruter i copywriter techniczny, stwórz perfekcyjnie dopasowane CV w języku polskim pod podaną ofertę pracy, bazując na profilu użytkownika oraz wygenerowanych wnioskach AI.

WYMOGI STYLU DOKUMENTU DLA SZABLONU "${templateId}":
${templateInstruction}

ZASADY DOPASOWYWANIA I SELEKCJI (Ważne):
1. Przeanalizuj ofertę pracy i zidentyfikuj kluczowe wymagania, słowa kluczowe i oczekiwania.
2. Z profilu użytkownika (i wniosków):
   - WYRÓŻNIJ (highlight) te umiejętności, doświadczenia i osiągnięcia, które są bezpośrednio przydatne i pożądane w tej ofercie. Dopasuj słownictwo w CV, aby bezpośrednio rezonowało z językiem oferty.
   - POMIŃ (omit) lub znacznie zminimalizuj sekcje, umiejętności lub szczegóły doświadczenia, które nie mają żadnego znaczenia dla tej konkretnej roli (np. pomiń doświadczenie jako kucharz lub barman, jeśli użytkownik aplikuje na Senior React Developera, chyba że wykazuje to unikalną cechę zarządzania zespołem, którą należy krótko uargumentować).
3. OPTYMALIZACJA OBJĘTOŚCI POD PEŁNE STRONY A4 (Kluczowe):
   - Standardem profesjonalnego CV jest zajmowanie DOKŁADNIE JEDNEJ PEŁNEJ STRONY A4 (one-page resume) lub ewentualnie DOKŁADNIE DWÓCH PEŁNYCH STRON przy bardzo rozbudowanym stażu.
   - Bezwzględnie unikaj sytuacji, w której treść rozlewa się na drugą stronę na zaledwie kilka luźnych zdań!
   - Skondensuj opisy obowiązków do 3-4 uderzających punktów na stanowisko, kładąc nacisk na konkretne rezultaty i technologie.
   - Zadbaj o zwartą, pełną objętość dokumentu, aby strona była harmonijnie i estetycznie wypełniona.
4. Stwórz atrakcyjne, dynamiczne podsumowanie zawodowe (professionalSummary) dostosowane do oferty.
5. Wygeneruj kompletne CV w formacie Markdown, gotowe do druku lub skopiowania. Powinno być eleganckie, z przejrzystą strukturą nagłówków, wypunktowaniami i profesjonalnym tonem.
${includePhoto ? "Użytkownik zaznaczył chęć dołączenia zdjęcia profilowego. Zdjęcie zostanie wyrenderowane automatycznie w prawym górnym rogu obok głównych danych. Dostosuj strukturę nagłówka Markdown tak, by ładnie współgrała z obecnością zdjęcia po prawej stronie (unikaj nadmiernych, szerokich linii poziomych w nagłówku kontaktowym)." : "Użytkownik zdecydował o wygenerowaniu wersji CV bez zdjęcia."}
6. JĘZYKI OBCE (DOKŁADNIE według profilu użytkownika):
   - Jeśli profil użytkownika zawiera języki obce (w tablicy 'languages' lub 'skills'), ZAWSZE uwzględnij je w dedykowanej sekcji '## Języki obce' (lub '## JĘZYKI OBCE').
   - Używaj DOKŁADNIE takich poziomów biegłości, jakie użytkownik podał w swoim profilu. Nie zmieniaj, nie zgaduj ani nie wymyślaj poziomów językowych na własną rękę.
7. Przygotuj listę decyzji rekrutacyjnych (tailoringDecisions) wyjaśniających użytkownikowi, dlaczego podjąłeś konkretne decyzje o wyróżnieniu, zmianie akcentów lub pominięciu danych elementów.

Oto profil użytkownika:
${JSON.stringify(profile, null, 2)}

Oto wnioski AI dotyczące użytkownika:
${JSON.stringify(conclusions, null, 2)}

Oto treść oferty pracy:
---
${jobOffer}
---`;

  const response = await generateWithFallback(ai, {
    contents: prompt,
    config: {
      systemInstruction: "Jesteś elitarnym rekruterem i ekspertem od autoprezentacji zawodowej. Tworzysz dokumenty aplikacyjne, które natychmiast przechodzą przez systemy ATS i zdobywają uznanie menedżerów zatrudnienia.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tailoredResumeMarkdown: { type: Type.STRING, description: "CV sformatowane w Markdown, zoptymalizowane pod tę konkretną ofertę pracy." },
          tailoringDecisions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                itemName: { type: Type.STRING, description: "Nazwa kompetencji, doświadczenia lub sekcji (np. 'Język SQL', 'Doświadczenie jako kucharz')" },
                action: { type: Type.STRING, description: "Działanie: 'Wyróżniono', 'Pominięto' lub 'Zmodyfikowano akcenty'" },
                reason: { type: Type.STRING, description: "Uzasadnienie decyzji po polsku (np. 'Oferta kładzie nacisk na bazy danych, dlatego przesunęliśmy SQL na pierwsze miejsce' lub 'Doświadczenie w gastronomii zostało pominięte, aby skupić uwagę wyłącznie na rolach IT')" }
              },
              required: ["itemName", "action", "reason"]
            }
          },
          professionalSummary: { type: Type.STRING, description: "Krótkie, chwytliwe podsumowanie zawodowe (ok. 3-4 zdania) dopasowane do oferty." }
        },
        required: ["tailoredResumeMarkdown", "tailoringDecisions", "professionalSummary"]
      }
    }
  });

  const parsed = cleanAndParseJson(response.text, {});
  res.json(parsed);
} catch (error: any) {
  console.log("[Doradca AI] generate-resume: chwilowy problem lub limit");
  const isQuota = error?.message?.includes("429") || error?.message?.includes("quota") || error?.status === "RESOURCE_EXHAUSTED";
  const msg = isQuota 
    ? "Chwilowo przekroczono limit zapytań darmowego API. Odczekaj kilkanaście sekund i spróbuj ponownie." 
    : "Wystąpił problem podczas dopasowywania CV. Spróbuj ponownie za chwilę.";
  res.status(500).json({ error: msg });
}
});

// 4. Parsowanie i wyodrębnianie struktury profilu z dołączonego pliku PDF z CV
app.post("/api/gemini/parse-pdf", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { pdfBase64 } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: "Brak danych pliku PDF (pdfBase64)." });
    }

    // Oczyszczenie nagłówków base64, jeśli zostały przekazane
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");

    const pdfPart = {
      inlineData: {
        mimeType: "application/pdf",
        data: cleanBase64
      }
    };

    const prompt = `Przeanalizuj dołączony plik PDF ze starym CV i wyodrębnij z niego jak najwięcej szczegółów dotyczących profilu zawodowego użytkownika w języku polskim.
Wypełnij precyzyjnie wszystkie sekcje w wyjściowym JSON-ie zgodnie z podanym schematem:
- personal: dane kontaktowe, miasto, podsumowanie zawodowe (bio)
- experience: lista dotychczasowych stanowisk z zakresem dat, opisem i lokalizacją
- education: wykształcenie, uczelnie, kierunki, lata nauki
- skills: lista umiejętności (przydziel je do odpowiednich kategorii np. Umiejętności techniczne, Umiejętności miękkie, Języki obce, Narzędzia) oraz określ poziom biegłości ('Podstawowy', 'Średni', 'Zaawansowany' lub 'Ekspert')
- achievements: certyfikaty, sukcesy, kursy, wyróżnienia

Postaraj się zachować jak najwyższy standard i dokładność przy analizie tekstu z pliku PDF. Jeśli brakuje jakichś danych (np. bio lub achievements), utwórz dla nich puste tablice lub wartości domyślne, ale nie zmyślaj danych.`;

    const response = await generateWithFallback(ai, {
      contents: [pdfPart, prompt],
      config: {
        systemInstruction: "Jesteś wybitnym asystentem kariery i ekspertem analizującym pliki aplikacyjne CV. Parsujesz dokumenty PDF z absolutną precyzją, wyciągając pełne i prawdziwe dane do struktury JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personal: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Imię i nazwisko" },
                email: { type: Type.STRING, description: "Adres e-mail" },
                phone: { type: Type.STRING, description: "Numer telefonu" },
                website: { type: Type.STRING, description: "Strona internetowa / Portfolio" },
                linkedin: { type: Type.STRING, description: "Link do profilu LinkedIn" },
                location: { type: Type.STRING, description: "Lokalizacja / Miasto" },
                bio: { type: Type.STRING, description: "Krótkie podsumowanie zawodowe / bio użytkownika" }
              },
              required: ["name"]
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING, description: "Nazwa firmy lub pracodawcy" },
                  role: { type: Type.STRING, description: "Stanowisko" },
                  startDate: { type: Type.STRING, description: "Data rozpoczęcia (np. RRRR-MM lub RRRR)" },
                  endDate: { type: Type.STRING, description: "Data zakończenia (np. RRRR-MM lub RRRR) lub puste/obecnie" },
                  isCurrent: { type: Type.BOOLEAN, description: "Czy to aktualne miejsce pracy" },
                  description: { type: Type.STRING, description: "Zakres obowiązków i kluczowe sukcesy/technologie" },
                  location: { type: Type.STRING, description: "Miasto lub informacja o pracy zdalnej" }
                },
                required: ["company", "role"]
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  school: { type: Type.STRING, description: "Nazwa szkoły lub uczelni" },
                  degree: { type: Type.STRING, description: "Stopień naukowy lub tytuł (np. Licencjat, Magister, Inżynier, Technik)" },
                  fieldOfStudy: { type: Type.STRING, description: "Kierunek studiów lub specjalność" },
                  startDate: { type: Type.STRING, description: "Data rozpoczęcia (np. RRRR)" },
                  endDate: { type: Type.STRING, description: "Data zakończenia (np. RRRR)" },
                  description: { type: Type.STRING, description: "Dodatkowy opis, osiągnięcia szkolne" }
                },
                required: ["school"]
              }
            },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nazwa umiejętności" },
                  category: { type: Type.STRING, description: "Kategoria umiejętności (np. 'Umiejętności techniczne', 'Umiejętności miękkie', 'Narzędzia', 'Języki obce')" },
                  proficiency: { type: Type.STRING, description: "Poziom biegłości: 'Podstawowy', 'Średni', 'Zaawansowany' lub 'Ekspert'" }
                },
                required: ["name", "category", "proficiency"]
              }
            },
            achievements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Nazwa nagrody, certyfikatu lub szkolenia" },
                  description: { type: Type.STRING, description: "Opis osiągnięcia" },
                  date: { type: Type.STRING, description: "Data uzyskania / certyfikacji (np. RRRR-MM)" }
                },
                required: ["title"]
              }
            }
          },
          required: ["personal", "experience", "education", "skills", "achievements"]
        }
      }
    });

    const parsed = cleanAndParseJson(response.text, {});
    res.json(parsed);
  } catch (error: any) {
    console.log("[Doradca AI] parse-pdf: chwilowy problem lub limit");
    const isQuota = error?.message?.includes("429") || error?.message?.includes("quota") || error?.status === "RESOURCE_EXHAUSTED";
    const msg = isQuota 
      ? "Chwilowo przekroczono limit zapytań darmowego API. Odczekaj kilkanaście sekund i spróbuj ponownie." 
      : "Błąd serwera podczas parsowania pliku PDF z CV.";
    res.status(500).json({ error: msg });
  }
});

// Konfiguracja Vite i serwowanie statycznych plików
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serwer uruchomiony na porcie ${PORT}`);
  });
}

startServer();
