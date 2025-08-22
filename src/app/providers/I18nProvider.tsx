"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { initI18n } from "@/lib/i18n";
import type { i18n } from "i18next";

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [i18nInstance, setI18nInstance] = useState<i18n | null>(null);

  useEffect(() => {
    const instance = initI18n();
    setI18nInstance(instance);
  }, []);

  if (!i18nInstance) {
    return <div>Loading...</div>;
  }

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}
