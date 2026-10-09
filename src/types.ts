export interface PersonalDetails {
  name: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  location: string;
  bio: string;
  photo?: string; // przechowuje Base64 lub URL zdjęcia profilowego
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  location: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string; // np. Języki programowania, Umiejętności miękkie, Narzędzia
  proficiency: "Podstawowy" | "Średni" | "Zaawansowany" | "Ekspert";
}

export interface Language {
  id: string;
  name: string;
  level: string; // np. C1, B2, Zaawansowany, Komunikatywny, Ojczysty
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

export interface DocumentInput {
  id: string;
  title: string;
  type: "text" | "link" | "document";
  content: string;
  addedAt: string;
}

export interface AIConsensus {
  type: string;
  title: string;
  explanation: string;
  confidence: string;
}

export interface AIQuestion {
  id: string;
  field: string;
  question: string;
  tip: string;
}

export interface TailoringDecision {
  itemName: string;
  action: string;
  reason: string;
}

export interface TailoredResume {
  tailoredResumeMarkdown: string;
  tailoringDecisions: TailoringDecision[];
  professionalSummary: string;
}

export interface UserProfile {
  personal: PersonalDetails;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  achievements: Achievement[];
  documents: DocumentInput[];
  conclusions: AIConsensus[];
}
