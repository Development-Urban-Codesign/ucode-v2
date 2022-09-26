import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from "./store/store.js";
import vuetify from './plugins/vuetify'
import '../node_modules/maplibre-gl/dist/maplibre-gl.css';
import 'bootstrap/dist/css/bootstrap.css';
import { loadFonts } from './plugins/webfontloader'
import { i18n } from "./plugins/i18n"

loadFonts()

createApp(App)
  .use(vuetify)
  .use(store)
  .use(router)
  .use(i18n)
  .mount('#app')
