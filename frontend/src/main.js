import Vue from 'vue'

import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import App from "./App.vue";
import store from '@/store/'
import translations from '@/translations/'
import VueI18n from "vue-i18n";

Vue.use(VueI18n)
Vue.use(Vuetify)
Vue.config.productionTip = false;
const i18n = new VueI18n({
  locale: store.state.locale,
  messages: translations,
})

new Vue({
    el: "#app",
    store,
    i18n: i18n,
    render: h => h(App),
    vuetify: new Vuetify({
        icons: {
          iconfont: 'mdiSvg'
        },
        theme: {
          defaultTheme: 'light'
        }
      }),
  });


