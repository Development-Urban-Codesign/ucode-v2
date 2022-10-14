import { createI18n } from "vue-i18n";
import messages from "../localization.json";

export const i18n = createI18n({
  locale: "de",
  fallbackLocale: "de", // set fallback locale
  messages,
  globalInjection: true,
  legacy: false,
});
