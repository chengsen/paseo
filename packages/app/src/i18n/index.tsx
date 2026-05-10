import { createContext, useContext, useMemo, type ReactNode } from "react";
import { en, type Translation } from "./translations/en";
import { zhCN } from "./translations/zh-CN";

export type Language = "en" | "zh-CN";

export const DEFAULT_LANGUAGE: Language = "en";

const TRANSLATIONS: Record<Language, Translation> = {
  en,
  "zh-CN": zhCN,
};

const I18nContext = createContext<{ language: Language; t: Translation }>({
  language: DEFAULT_LANGUAGE,
  t: en,
});

export function I18nProvider({ children, language }: { children: ReactNode; language: Language }) {
  const value = useMemo(
    () => ({
      language,
      t: TRANSLATIONS[language] ?? en,
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}
