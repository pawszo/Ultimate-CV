import { UserProfile } from "./types";

export const initialProfile: UserProfile = {
  personal: {
    name: "Jan Kowalski",
    email: "jan.kowalski@example.com",
    phone: "+48 501 234 567",
    website: "https://jankowalski.dev",
    linkedin: "https://linkedin.com/in/jankowalski-demo",
    location: "Kraków, Polska",
    bio: "Jestem elastycznym i zmotywowanym profesjonalistą z doświadczeniem zarówno w pracy zespołowej w gastronomii, jak i w precyzyjnym rozwiązywaniu problemów technicznych jako programista frontend.",
    photo: ""
  },
  experience: [
    {
      id: "exp-1",
      company: "TechSolutions Sp. z o.o.",
      role: "Junior Frontend Developer",
      startDate: "2023-01",
      endDate: "2024-03",
      isCurrent: false,
      location: "Kraków (Hybrydowo)",
      description: "Tworzenie i rozbudowa interfejsów użytkownika w aplikacjach React i TypeScript. Współpraca z zespołem UX/UI, pisanie testów jednostkowych, optymalizacja czasu ładowania stron oraz integracja z zewnętrznymi API."
    },
    {
      id: "exp-2",
      company: "Restauracja Srebrny Widelec",
      role: "Kucharz Sekcji (Chef de Partie)",
      startDate: "2020-05",
      endDate: "2022-12",
      isCurrent: false,
      location: "Kraków",
      description: "Nadzór nad sekcją dań gorących, dbanie o najwyższą jakość serwowanych posiłków, dbałość o standardy czystości i procedury HACCP. Praca pod dużą presją czasu w dynamicznym zespole kuchennym."
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "Politechnika Krakowska",
      degree: "Inżynier",
      fieldOfStudy: "Informatyka Stosowana",
      startDate: "2019-10",
      endDate: "2023-02",
      description: "Praca dyplomowa z zakresu optymalizacji wydajności aplikacji internetowych."
    }
  ],
  skills: [
    { id: "sk-1", name: "JavaScript", category: "Umiejętności techniczne", proficiency: "Zaawansowany" },
    { id: "sk-2", name: "React", category: "Umiejętności techniczne", proficiency: "Zaawansowany" },
    { id: "sk-3", name: "TypeScript", category: "Umiejętności techniczne", proficiency: "Średni" },
    { id: "sk-4", name: "Dbanie o procedury HACCP", category: "Inne", proficiency: "Ekspert" },
    { id: "sk-5", name: "Przygotowywanie dań kuchni polskiej i włoskiej", category: "Inne", proficiency: "Ekspert" },
    { id: "sk-6", name: "Zarządzanie czasem", category: "Umiejętności miękkie", proficiency: "Zaawansowany" }
  ],
  languages: [
    { id: "lang-1", name: "Język angielski", level: "C1 (Zaawansowany / Płynny)" },
    { id: "lang-2", name: "Język niemiecki", level: "B1 (Średniozaawansowany)" },
    { id: "lang-3", name: "Język polski", level: "Ojczysty (Native)" }
  ],
  achievements: [
    {
      id: "ach-1",
      title: "Wyróżnienie za projekt roku w TechSolutions",
      date: "2023-11",
      description: "Nagroda za samodzielne wdrożenie nowego, w pełni dostępnego (WCAG) panelu administracyjnego w systemie B2B."
    },
    {
      id: "ach-2",
      title: "Certyfikat ukończenia kursu kulinarnego Kuchni Śródziemnomorskiej",
      date: "2021-08",
      description: "Intensywne warsztaty u boku certyfikowanych włoskich szefów kuchni zakończone egzaminem praktycznym."
    }
  ],
  documents: [
    {
      id: "doc-1",
      title: "Notatka z rozmowy ewaluacyjnej",
      type: "text",
      content: "Jan wykazuje się doskonałym skupieniem na szczegółach. Ceni sobie czystość kodu tak samo jak porządek na stanowisku pracy. Potrafi pracować w stresie i świetnie dogaduje się z innymi programistami i menedżerami.",
      addedAt: "2024-02-15"
    }
  ],
  conclusions: [
    {
      type: "umiejętność miękka",
      title: "Praca pod presją czasu",
      explanation: "Z racji wieloletniego doświadczenia jako Kucharz Sekcji w renomowanej restauracji, posiadasz wybitną zdolność sprawnego działania w kryzysowych momentach z zachowaniem standardów jakości.",
      confidence: "wysoki"
    },
    {
      type: "umiejętność twarda",
      title: "Zdolności analityczne",
      explanation: "Twoje wykształcenie inżynierskie w połączeniu z doświadczeniem komercyjnym przy tworzeniu aplikacji React / TypeScript dowodzi silnych umiejętności rozwiązywania problemów i myślenia algorytmicznego.",
      confidence: "wysoki"
    },
    {
      type: "wiedza dziedzinowa",
      title: "Zarządzanie zapasami i higiena HACCP",
      explanation: "Praca na kuchni profesjonalnej dała Ci gruntowne rozeznanie w optymalnym doborze składników i logistyce stanowiskowej.",
      confidence: "wysoki"
    }
  ]
};
