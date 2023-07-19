import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import App from './App.vue';
import store from '@/store/';
import translations from '@/translations/';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);
Vue.use(Vuetify);
Vue.config.productionTip = false;

const i18n = new VueI18n({
  locale: store.state.locale,
  messages: translations,
});

const vuetify = new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#005A9F', // Set your primary color here KVR Farbe
        secondary: '#005A9F', // Set your secondary color here KVR Farbe
        accent: '#005A9F', // Set your accent color here KVR Farbe
      },
    },
  },
  icons: {
    iconfont: 'mdiSvg',
  },
});

new Vue({
  el: '#app',
  store,
  i18n,
  vuetify,
  render: h => h(App),
});
