import { createI18n } from 'vue-i18n';

const messages = {
  "en": {
    "Quest": {
      "greeting":"Welcome"
    }
  },
  "de": {
    "Quest": {
      "greeting": "Willkommen"
    }
  },

}


export const i18n = createI18n({
  locale: 'de',
  fallbackLocale: 'de', // set fallback locale
  messages,
});
