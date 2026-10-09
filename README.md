# 📄 Ultimate CV / Digital Resume Creator

> **Inteligentny kreator życiorysu zawodowego napędzany sztuczną inteligencją Gemini.**  
> Twórz nieskazitelne, spersonalizowane profile zawodowe, analizuj oferty pracy, wyciągaj ukryte kompetencje i generuj dopasowane dokumenty CV gotowe do pobrania w formacie PDF lub Markdown.

---

## 🌐 Spis treści / Table of Contents
- [Wprowadzenie / Introduction](#-wprowadzenie--introduction)
- [Kluczowe funkcjonalności / Key Features](#-kluczowe-funkcjonalności--key-features)
- [Instrukcja obsługi krok po kroku (PL)](#-instrukcja-obsługi-krok-po-kroku-pl)
  - [1. Uzupełnienie profilu zawodowego](#1-uzupełnienie-profilu-zawodowego)
  - [2. Inteligentny import ze starego pliku PDF](#2-inteligentny-import-ze-starego-pliku-pdf)
  - [3. Dokumenty i dedukcja kompetencji (AI)](#3-dokumenty-i-dedukcja-kompetencji-ai)
  - [4. Inteligentny Doradca AI](#4-inteligentny-doradca-ai)
  - [5. Generowanie CV dopasowanego do oferty pracy](#5-generowanie-cv-dopasowanego-do-oferty-pracy)
  - [6. Eksport do PDF oraz Markdown](#6-eksport-do-pdf-oraz-markdown)
  - [7. Kopia zapasowa, szyfrowanie (.cvp) i chmura](#7-kopia-zapasowa-szyfrowanie-cvp-i-chmura)
- [User Manual & Step-by-Step Guide (EN)](#-user-manual--step-by-step-guide-en)
  - [1. Profile Building & PDF Import](#1-profile-building--pdf-import)
  - [2. Inferred Competencies & Document Analysis](#2-inferred-competencies--document-analysis)
  - [3. Interactive AI Career Advisor](#3-interactive-ai-career-advisor)
  - [4. Tailored Resume Generation for Job Postings](#4-tailored-resume-generation-for-job-postings)
  - [5. Export to PDF & Markdown](#5-export-to-pdf--markdown)
  - [6. Encryption, Cloud Sync & Backups](#6-encryption-cloud-sync--backups)
- [Dostępne szablony graficzne / Templates](#-dostępne-szablony-graficzne--templates)
- [Instalacja i uruchomienie lokalne / Local Setup](#-instalacja-i-uruchomienie-lokalne--local-setup)
- [Stos technologiczny / Tech Stack](#-stos-technologiczny--tech-stack)
- [Bezpieczeństwo i prywatność / Security & Privacy](#-bezpieczeństwo-i-prywatność--security--privacy)

---

## 🚀 Wprowadzenie / Introduction

**Ultimate CV** rozwiązuje odwieczny problem żmudnego formatowania życiorysów i dopasowywania ich do dziesiątek różnych ogłoszeń rekrutacyjnych. Aplikacja nie tylko porządkuje historię zatrudnienia, ale korzysta z zaawansowanych modeli **Google Gemini**, aby:
1. Analizować Twoje doświadczenie i **dedukować ukryte umiejętności** (np. programista -> zaawansowane myślenie analityczne i rozwiązywanie problemów).
2. Generować w kilka sekund **idealnie skrojone CV pod konkretne ogłoszenie o pracę**, eksponując dokładnie te słowa kluczowe i projekty, których szuka rekruter lub system ATS.
3. Wyjaśniać każdą decyzję rekrutacyjną (dlaczego dany element został wyróżniony, a inny pominięty).

Aplikacja posiada **pełne wsparcie dwujęzyczne (Polski / English)** – przełącznik `PL | EN` znajduje się bezpośrednio w prawym górnym rogu paska nawigacyjnego.

---

## ✨ Kluczowe funkcjonalności / Key Features

- 👤 **Kompletny profil kandydata**: Dane kontaktowe, podsumowanie zawodowe (bio), zdjęcie profilowe, doświadczenie zawodowe, wykształcenie, umiejętności z podziałem na poziomy zaawansowania, języki obce (skala CEFR) oraz certyfikaty i nagrody.
- 📥 **Automatyczny import z PDF**: Wgraj swoje dotychczasowe CV w formacie PDF – sztuczna inteligencja multimodalna rozpozna tekst, przetłumaczy sekcje i automatycznie wypełni formularze profilu.
- 🧠 **Moduł analizy dokumentów i wnioskowania**: Wklejaj notatki, referencje, opisy projektów lub linki – AI wyekstrahuje kluczowe fakty oraz wyciągnie logiczne wnioski o Twoich kompetencjach twardych i miękkich.
- 💡 **Interaktywny Doradca AI**: Zadaje trafne pytania pogłębiające (np. o konkretne liczby, metryki biznesowe, narzędzia), uzupełniając luki w Twoim profilu.
- 🎯 **Dopasowanie CV pod ofertę pracy (ATS-Friendly)**: Wklej treść oferty rekrutacyjnej, wybierz szablon i język docelowy, a AI stworzy życiorys skondensowany do 1 strony A4 zoptymalizowany pod kątem selekcji rekrutacyjnej.
- 🎨 **4 profesjonalne szablony wizualne**: *Klasyczny* (elegancki i tradycyjny), *Nowoczesny* (minimalistyczny, czytelny układ), *Inżynieria & IT* (techniczny, estetyczne tagi technologii) oraz *Kreatywny* (dynamiczny styl).
- 🖨️ **Eksport do PDF i Markdown**: Pobieraj gotowy do wysłania plik `.pdf` wygenerowany z zachowaniem właściwych marginesów A4 lub plik `.md` do dalszej edycji.
- 🔐 **Bezpieczeństwo danych**:
  - Pełne szyfrowanie eksportu kopii zapasowej do pliku `.cvp` przy użyciu hasła (algorytm AES).
  - Opcjonalna integracja z logowaniem kontem Google (Firebase Authentication) oraz zapisem w bezpiecznej bazie Firebase Firestore.
  - Automatyczny bezpieczny zapis podręczny w `localStorage` przeglądarki.

---

## 📖 Instrukcja obsługi krok po kroku (PL)

### 1. Uzupełnienie profilu zawodowego
1. Po otwarciu aplikacji przejdź do zakładki **Profil Kandydata** (domyślna zakładka).
2. Wypełnij poszczególne sekcje:
   - **Dane osobowe**: Podaj imię, nazwisko, tytuł zawodowy, dane kontaktowe, linki (LinkedIn, GitHub/portfolio) oraz zwięzłe podsumowanie zawodowe (Bio). Możesz opcjonalnie wgrać zdjęcie profilowe.
   - **Doświadczenie zawodowe**: Dodaj stanowiska, nazwy pracodawców, ramy czasowe oraz kluczowe obowiązki i sukcesy.
   - **Wykształcenie**: Uczelnie, szkoły, uzyskane tytuły i kierunki studiów.
   - **Umiejętności**: Podaj technologie i umiejętności, wybierając ich poziom (Podstawowy, Średni, Zaawansowany, Ekspert) oraz kategorię.
   - **Języki obce**: Określ znajomość języków wg międzynarodowej skali (np. C1, B2, Ojczysty).
   - **Certyfikaty i osiągnięcia**: Ukończone szkolenia, certyfikaty branżowe, nagrody czy publikacje.

### 2. Inteligentny import ze starego pliku PDF
1. Jeśli posiadasz już CV w formacie PDF, kliknij przycisk **"Importuj CV z PDF"** w nagłówku.
2. Przeciągnij plik PDF lub wybierz go z dysku.
3. System przeanalizuje zawartość pliku z wykorzystaniem widzenia multimodalnego Gemini.
4. Wyświetli się podgląd wyodrębnionych danych – możesz je przejrzeć i zatwierdzić przyciskiem **"Zastosuj dane do profilu"**.

### 3. Dokumenty i dedukcja kompetencji (AI)
1. Przejdź do zakładki **"Dokumenty i Wnioski"**.
2. Wklej dowolny tekst pomocniczy: opis projektu, treść referencji od przełożonego, zakres obowiązków lub link do materiałów.
3. Kliknij **"Analizuj dokument i wyciągnij wnioski"**.
4. Model AI:
   - Wyodrębni suche fakty (nowe umiejętności, role, edukację), które możesz włączyć do profilu jednym kliknięciem.
   - Wygeneruje **dedukowane kompetencje** (np. wywnioskowana praca pod presją czasu, znajomość dobrych praktyk czystego kodu), które będą brane pod uwagę podczas tworzenia CV.

### 4. Inteligentny Doradca AI
1. Otwórz zakładkę **"Doradca AI"**.
2. Kliknij **"Odśwież pytania doradcy"**.
3. Model przeanalizuje Twój profil i zidentyfikuje obszary wymagające wzmocnienia (np. brak mierzalnych sukcesów w liczbach, brak podanych narzędzi).
4. Odpowiedz na zaproponowane pytania, a wygenerowane odpowiedzi zaktualizują Twój profil zawodowy.

### 5. Generowanie CV dopasowanego do oferty pracy
1. Przejdź do zakładki **"Dopasuj do Oferty"**.
2. Wklej pełną treść ogłoszenia o pracę (wymagania, opis stanowiska, technologie) lub kliknij **"Generuj ogólne CV"**, aby stworzyć reprezentacyjne CV bez podawania oferty.
3. Skonfiguruj parametry dokumentu:
   - **Szablon graficzny**: Wybierz jeden z 4 dostępnych stylów (Klasyczny, Nowoczesny, Techniczny IT, Kreatywny).
   - **Język tworzonego dokumentu**: Wybierz język generowania spośród: 🇵🇱 Polski (PL), 🇬🇧 Angielski (EN), 🇩🇪 Niemiecki (DE), 🇪🇸 Hiszpański (ES), 🇫🇷 Francuski (FR).
   - **Zdjęcie profilowe**: Zaznacz, czy chcesz umieścić zdjęcie w nagłówku CV.
4. Kliknij **"Wygeneruj spersonalizowane CV"**.
5. Po chwili po prawej stronie pojawi się:
   - **Uzasadnienie decyzji rekrutacyjnych**: Raport pokazujący, co zostało wyeksponowane, co pominięto jako nieistotne i dlaczego.
   - **Podsumowanie profilu**: 3-4 mocne zdania otwierające CV.
   - **Arkusz podglądu A4**: Renderowany zoptymalizowany dokument.

### 6. Wybór języka podglądu (Lookup) oraz eksportowanego pliku
- **Wybór języka podglądu (Lookup)**:
  - W górnym pasku dokumentu znajduje się przełącznik **"Język podglądu (Lookup)"** (🇵🇱 PL, 🇬🇧 EN, 🇩🇪 DE, 🇪🇸 ES, 🇫🇷 FR).
  - Kliknięcie dowolnego języka natychmiast tłumaczy i aktualizuje podgląd dokumentu w locie z zachowaniem oryginalnego układu i formatowania.
  - Tłumaczenia są zapamiętywane w pamięci podręcznej, co pozwala na natychmiastowe przełączanie się między językami.
- **Wybór języka i formatu eksportowanego pliku**:
  - Kliknij przycisk **"Eksportuj plik"** lub szybki przycisk **"Pobierz PDF"**.
  - W oknie opcji eksportu możesz wybrać:
    - **Język pliku docelowego**: Wybierz dowolny z obsługiwanych języków (PL, EN, DE, ES, FR).
    - **Format pliku**:
      - **PDF (.pdf)**: Gotowy do druku dokument A4 o wysokiej rozdzielczości z zachowaniem stylów i marginesów.
      - **Markdown (.md)**: Surowy plik tekstowy ze strukturą Markdown.
      - **Czysty tekst (.txt)**: Tekst sformatowany do łatwego wklejania w formularze systemów rekrutacyjnych (ATS).
  - Nazwa pobranego pliku automatycznie uwzględnia imię i nazwisko kandydata oraz kod języka (np. `CV_Jan_Kowalski_EN.pdf`).

### 7. Kopia zapasowa, szyfrowanie (.cvp) i chmura
- **Eksport zaszyfrowany (.cvp)**: W nagłówku kliknij ikonę pobierania/eksportu. Podaj hasło szyfrowania – profil zostanie zaszyfrowany algorytmem AES.
- **Import z pliku (.cvp)**: Kliknij ikonę wgrywania, wskaż plik `.cvp` i wpisz hasło, aby odtworzyć profil na dowolnym urządzeniu.
- **Synchronizacja w chmurze**: Kliknij **"Zaloguj przez Google"**. Po zalogowaniu możesz jednym kliknięciem zapisać swój profil w chmurze Firebase oraz wczytać go na innym komputerze.

---

## 📘 User Manual & Step-by-Step Guide (EN)

### 1. Profile Building & PDF Import
- Navigate to the **Candidate Profile** tab.
- Enter your personal details, contact information, GitHub/LinkedIn links, and a concise professional summary (Bio).
- Add your work experience, education, foreign languages with CEFR proficiency levels, categorized skills, and achievements.
- **Existing Resume Import**: Click **"Import CV from PDF"** in the top bar. Upload your old resume file; Gemini Multimodal will automatically parse the document structure into editable form fields.

### 2. Inferred Competencies & Document Analysis
- Switch to the **"Documents & Insights"** tab.
- Paste project briefs, past reviews, reference letters, or online portfolio links.
- Click **"Analyze document & draw conclusions"**.
- The AI deduces implicit skills (e.g. system architecture mastery, client communications, agile leadership) and lets you merge extracted facts directly into your profile.

### 3. Interactive AI Career Advisor
- Open the **"AI Advisor"** tab.
- Click **"Refresh advisor questions"** to get contextual, targeted interview prompts based on your current profile gaps (such as missing metrics, KPIs, or tech stack details).
- Answering these prompts strengthens your resume's competitive edge.

### 4. Tailored & General Resume Generation
- Head to the **"Tailor to Job Offer"** tab.
- Paste the target job posting (requirements, responsibilities, keywords) or click **"Generate General CV"** to create a complete resume directly from your profile without a specific job offer.
- Choose:
  - **Template style**: Classic, Modern, Tech (IT / DevOps), or Creative.
  - **Document Language**: Select target language: 🇵🇱 Polish (PL), 🇬🇧 English (EN), 🇩🇪 German (DE), 🇪🇸 Spanish (ES), 🇫🇷 French (FR).
  - **Photo toggle**: Enable or disable profile photo display.
- Hit **"Generate Resume"**.
- Review the **AI Tailoring Decisions** table to understand why specific roles were highlighted or omitted to match the role's ATS requirements.

### 5. Document Lookup & File Export Language Selection
- **Document Lookup Language**:
  - Switch the **"Lookup Language"** toolbar at the top of the preview to instantly view the resume in 🇵🇱 PL, 🇬🇧 EN, 🇩🇪 DE, 🇪🇸 ES, or 🇫🇷 FR.
  - The document is translated on the fly by Gemini, maintaining exact markdown formatting, structure, and design.
  - Translations are cached for immediate switching.
- **Exported File Language & Formats**:
  - Click **"Export File"** to open export options.
  - Choose your desired **File Language** (PL, EN, DE, ES, FR).
  - Select your desired **Format**:
    - **PDF (.pdf)**: High-resolution print-ready A4 document formatted with styles and photos.
    - **Markdown (.md)**: Plain text with markdown hierarchy.
    - **Plain Text (.txt)**: Clean unformatted text for pasting into application tracking systems (ATS).
  - Downloaded filenames include candidate name and language code (e.g. `CV_John_Doe_EN.pdf`).

### 6. Encryption, Cloud Sync & Backups
- **Encrypted Export (.cvp)**: Export your full profile encrypted with an AES password via the shield/download button.
- **Encrypted Import**: Restore your profile by providing your `.cvp` file and password.
- **Google Cloud Sync**: Sign in with Google to persist your resume profile securely to Google Firebase Firestore.

---

## 🎨 Dostępne szablony graficzne / Templates

| Szablon / Template | Charakterystyka / Description | Zastosowanie / Best For |
| :--- | :--- | :--- |
| **Klasyczny (Classic)** | Tradycyjny, stonowany, formalny podział z czytelnymi nagłówkami i wyważoną typografią. | Korporacje, finanse, prawo, administracja, medycyna. |
| **Nowoczesny (Modern)** | Przejrzysty, minimalistyczny, przestronny układ z oszczędnym formatowaniem i silnym akcentem na słowa kluczowe. | Marketing, zarządzanie projektami, consulting, sprzedaż. |
| **Inżynieria & IT (Tech)** | Techniczny styl skupiony wokół technologii; tagi kodu dla narzędzi (\`React\`, \`Docker\`, \`PostgreSQL\`) oraz formuła [Działanie] + [Technologia] + [Mierzalny Wpływ]. | Programiści, DevOps, QA, Architekci Cloud, Data Science. |
| **Kreatywny (Creative)** | Dynamiczny styl z angażującym podsumowaniem zawodowym i nowoczesnymi akcentami wizualnymi. | UI/UX Designerzy, graficy, twórcy treści, agencje reklamowe. |

---

## 💻 Instalacja i uruchomienie lokalne / Local Setup

### Wymagania wstępne / Prerequisites
- **Node.js** w wersji 20+ lub 22+
- Menedżer pakietów **npm**
- Klucz API **Google Gemini** ([Pobierz z Google AI Studio](https://aistudio.google.com/))

### Krok 1: Klonowanie i instalacja pakietów
```bash
git clone <adres-repozytorium>
cd ultimate-cv
npm install
```

### Krok 2: Konfiguracja zmiennych środowiskowych
Utwórz plik `.env` w głównym katalogu projektu na podstawie `.env.example`:
```bash
cp .env.example .env
```
Uzupełnij klucz API w pliku `.env`:
```env
GEMINI_API_KEY=twoj_klucz_api_gemini
PORT=3000
```

> **Uwaga dot. bezpieczeństwa**: Plik `.env` oraz wszelkie klucze są automatycznie ignorowane przez system kontroli wersji (`.gitignore`). Nigdy nie publikuj swoich prywatnych kluczy w repozytorium!

### Krok 3: Uruchomienie serwera deweloperskiego
```bash
npm run dev
```
Aplikacja uruchomi się pod adresem: `http://localhost:3000`.

### Krok 4: Budowanie produkcyjne
```bash
npm run build
npm start
```

---

## 🛠️ Stos technologiczny / Tech Stack

- **Interfejs użytkownika (Frontend)**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion (Framer Motion).
- **Backend**: Node.js, Express, tsx, esbuild.
- **Sztuczna Inteligencja (AI Engine)**: SDK `@google/genai` (modele `gemini-3.1-flash-lite` oraz `gemini-3.8-flash` z automatycznym mechanizmem fallback).
- **Bezpieczeństwo i Baza Danych**: Firebase Authentication (Google Sign-In), Cloud Firestore, szyfrowanie symetryczne AES (Web Crypto API).
- **Generowanie dokumentów**: jsPDF, html2canvas-pro, react-markdown.

---

## 🔒 Bezpieczeństwo i prywatność / Security & Privacy

1. **Przechowywanie danych**: Twoje dane osobowe domyślnie pozostają wyłącznie w Twojej przeglądarce (`localStorage`).
2. **Kopia zapasowa `.cvp`**: Pliki eksportu profilu są szyfrowane hasłem po stronie klienta za pomocą standardu kryptograficznego AES-GCM przed zapisaniem na dysk.
3. **Chmura Google**: Logowanie przez Google oraz zapis w Firestore wymaga autoryzacji – każdy użytkownik ma dostęp wyłącznie do własnych dokumentów powiązanych z jego identyfikatorem `uid`.
4. **Zapobieganie wyciekom**: Pliki konfiguracyjne i certyfikaty są ściśle chronione przez reguły `.gitignore`.

---

*Życzymy owocnego tworzenia życiorysu i sukcesów w procesach rekrutacyjnych!*  
*Happy resume crafting & best of luck with your career opportunities!*
