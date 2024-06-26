<template>
  <v-app>
    <SvgSprite />
    <link :href="`${linkBaseUrl}css/vuetify.min.css`" rel="stylesheet">
    <link :href="`${linkBaseUrl}css/materialdesignicons.min.css`" rel="stylesheet">
    <link :href="`${linkBaseUrl}css/style.css`" rel="stylesheet">
    <link :href="`${linkBaseUrl}css/patternlab.css`" rel="stylesheet">
    <AppointmentForm v-if="stylesLoaded && !errorNotFound"/>
    <NotFound v-if="errorNotFound" />
  </v-app>
</template>

<script>
import AppointmentForm from '@/components/AppointmentForm';
import NotFound from '@/components/NotFound';
import SvgSprite from '@/components/SvgSprite';
import store from "@/store";
import translations from "@/translations";
import Vue from "vue";
import VueI18n from "vue-i18n";
import Vuetify from "vuetify";

Vue.use(VueI18n)
Vue.use(Vuetify)

const i18n = new VueI18n({
  locale: store.state.locale,
  messages: translations,
})

export default {
  store: store,
  i18n: i18n,
  vuetify: new Vuetify({
    icons: {
      iconfont: 'mdiSvg'
    },
    theme: {
      defaultTheme: 'light'
    }
  }),
  props: ['baseUrl', 'serviceId', 'locationId', 'appointmentHash', 'confirmAppointmentHash'],
  components: {
    AppointmentForm,
    NotFound,
    SvgSprite
  },
  data() {
    return {
      stylesLoaded: false,
    }
  },
  computed: {
    linkBaseUrl () {
      if (process.env.NODE_ENV === 'development' || typeof this.baseUrl === 'undefined') {
        return '/buergeransicht/'
      }

      return this.baseUrl + '/'
    },
    errorNotFound() {
      return this.$store.state.error === 'not-found';
    },
  },
  mounted () {
    this.loadStylesHackyWay();
  },
  methods: {
    loadData() {
      let baseUrl = this.baseUrl ?? '/buergeransicht'
      if (process.env.NODE_ENV === 'development') {
        baseUrl = 'http://localhost:8080/buergeransicht'
      }

      this.$store.state.settings.endpoints["VUE_APP_ZMS_API_BASE"] = baseUrl

      this.$store.dispatch('setUpServicesAndProviders', {
        preselectedService: this.serviceId ?? null,
        preselectedProvider: this.locationId ?? null
      }).then(() => {
        if (this.appointmentHash) {
          this.$store.dispatch('setUpAppointment', {
            appointmentHash: this.appointmentHash
          })

          this.$store.state.openedPanel = 3
          this.$store.state.confirmedAppointment = true
        }

        if (this.confirmAppointmentHash) {
          this.$store.dispatch('confirmReservation', {
            appointmentHash: this.confirmAppointmentHash
          }).then((success) => {
            if (success) {
              this.$store.state.activatedAppointment = success
            } else {
              this.$store.dispatch('setUpAppointment', {
                appointmentHash: this.confirmAppointmentHash
              })
            }

            this.$store.state.openedPanel = 3
            this.$store.state.confirmedAppointment = true
          })
        }
        this.$store.dispatch('setUpCaptchaDetails');
      })
    },
    loadStylesHackyWay() {
      const styles = [
        `${this.linkBaseUrl}css/vuetify.min.css`,
        `${this.linkBaseUrl}css/materialdesignicons.min.css`,
        `${this.linkBaseUrl}css/style.css`,
        `${this.linkBaseUrl}css/patternlab.css`,
      ];
      const promises = styles.map(style => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = style;
        return new Promise((resolve, reject) => {
          link.onload = resolve;
          link.onerror = reject;
          document.head.appendChild(link);
        });
      });

      Promise.all(promises).then(() => {
        this.stylesLoaded = true;
        this.loadData();
      }).catch((error) => {
        console.error('Error loading styles:', error);
      });
    }
  },
}
</script>

<style>

</style>
