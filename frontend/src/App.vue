<template>
  <v-app>
    <link :href="`${linkBaseUrl}css/vuetify.min.css`" rel="stylesheet">
    <link :href="`${linkBaseUrl}css/materialdesignicons.min.css`" rel="stylesheet">
    <link :href="`${linkBaseUrl}css/style.css`" rel="stylesheet">

    <AppointmentForm />
  </v-app>
</template>
<script>
import AppointmentForm from '@/components/AppointmentForm';
import store from '@/store';
import translations from '@/translations';
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
    AppointmentForm
  },
  computed: {
    linkBaseUrl () {
      return process.env.NODE_ENV === 'development' ? "" : this.baseUrl + "/"
    }
  },
  mounted () {
    this.$store.state.settings.endpoints["VUE_APP_ZMS_API_BASE"] = this.baseUrl

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
          console.log("success", success);
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
    })
  }
}
</script>

<style>

</style>
