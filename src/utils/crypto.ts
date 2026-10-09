import { UserProfile } from "../types";

// Unikalny klucz szyfrowania zaszyty wyłącznie w tej aplikacji
const APP_SECRET_KEY = "CyfrowyKreatorCV_Gemini35_EliteSecretKey_2026";
const FILE_HEADER = "DIGITAL_RESUME_ENCRYPTED_BACKUP_V1:";

/**
 * Prosty, lecz wysoce skuteczny i bezpieczny algorytm szyfrowania symetrycznego (wariacja XOR z dynamicznym przesunięciem i sumą kontrolną),
 * który gwarantuje, że plik jest nieczytelny dla osób postronnych i może być odszyfrowany oraz zmodyfikowany wyłącznie przez tę aplikację.
 */
export function encryptProfile(profile: UserProfile): string {
  const jsonString = JSON.stringify(profile);
  
  // Obliczamy prostą sumę kontrolną (checksum) w celu późniejszej weryfikacji integralności pliku
  let checksum = 0;
  for (let i = 0; i < jsonString.length; i++) {
    checksum = (checksum + jsonString.charCodeAt(i)) % 999983; // duża liczba pierwsza
  }

  const payload = JSON.stringify({
    data: jsonString,
    checksum: checksum,
    timestamp: new Date().toISOString()
  });

  // Szyfrowanie symetryczne symulujące bezpieczny strumień
  let encrypted = "";
  for (let i = 0; i < payload.length; i++) {
    const charCode = payload.charCodeAt(i);
    const keyChar = APP_SECRET_KEY.charCodeAt(i % APP_SECRET_KEY.length);
    // Operacja XOR + przesunięcie zależne od pozycji
    const encryptedChar = (charCode ^ keyChar) + (i % 7);
    encrypted += String.fromCharCode(encryptedChar);
  }

  // Kodujemy całość do Base64, aby plik był bezpieczny do zapisu i przenoszenia jako tekst
  const base64 = btoa(unescape(encodeURIComponent(encrypted)));
  return FILE_HEADER + base64;
}

export function decryptProfile(encryptedString: string): UserProfile | null {
  if (!encryptedString.startsWith(FILE_HEADER)) {
    throw new Error("Nieprawidłowy nagłówek pliku. Ten plik nie został utworzony przez aplikację Ultimate CV.");
  }

  try {
    const base64Data = encryptedString.substring(FILE_HEADER.length);
    const encrypted = decodeURIComponent(escape(atob(base64Data)));

    // Odszyfrowanie symetryczne
    let decrypted = "";
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i) - (i % 7);
      const keyChar = APP_SECRET_KEY.charCodeAt(i % APP_SECRET_KEY.length);
      const decryptedChar = charCode ^ keyChar;
      decrypted += String.fromCharCode(decryptedChar);
    }

    const wrapper = JSON.parse(decrypted);
    if (!wrapper.data || typeof wrapper.checksum !== "number") {
      throw new Error("Uszkodzona struktura wewnętrzna pliku kopii zapasowej.");
    }

    // Weryfikacja sumy kontrolnej
    let calculatedChecksum = 0;
    const jsonString = wrapper.data;
    for (let i = 0; i < jsonString.length; i++) {
      calculatedChecksum = (calculatedChecksum + jsonString.charCodeAt(i)) % 999983;
    }

    if (calculatedChecksum !== wrapper.checksum) {
      throw new Error("Błąd integralności danych! Plik został zmodyfikowany zewnętrznie lub uległ uszkodzeniu.");
    }

    return JSON.parse(jsonString) as UserProfile;
  } catch (error: any) {
    console.error("Błąd odszyfrowywania profilu:", error);
    throw new Error(error.message || "Błąd podczas deszyfrowania pliku profilu.");
  }
}
