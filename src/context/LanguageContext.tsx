// src/context/LanguageContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "../utils/i18n";

type SupportedLanguage = "en" | "hi" | "ta" | "raj";

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lng: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  // On mount: read saved language from localStorage (if any)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("lang") as SupportedLanguage | null;

    if (saved && ["en", "hi", "ta", "raj"].includes(saved)) {
      setLanguageState(saved);
      i18n.changeLanguage(saved);
    } else {
      i18n.changeLanguage("en");
    }
  }, []);

  const setLanguage = (lng: SupportedLanguage) => {
    setLanguageState(lng);
    i18n.changeLanguage(lng);

    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lng);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
};
