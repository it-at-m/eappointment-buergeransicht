<template>
  <v-app data-app>
    <v-main>
      <v-container>
        <AppointmentForm v-if="stylesLoaded" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppointmentForm from '@/components/AppointmentForm';
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component({

  components: {
    AppointmentForm
  },

  data() {
    return {
      stylesLoaded: false,
    }
  },
  computed: {
    linkBaseUrl() {
      return process.env.NODE_ENV === 'development' ? "/buergeransicht/" : `${process.env.VUE_APP_API_URL}` + "/buergeransicht/"
    }
  },
  mounted() {

    const urlElements = window.location.hash.split('/')

    if (urlElements.length >= 3 && urlElements[1] === 'services') {
      this.$el.setAttribute('service-id', urlElements[2]);
      // Trigger the corresponding store action or mutation
      this.$store.dispatch('setService', urlElements[2]);
    }

    if (urlElements.length >= 5 && urlElements[3] === 'locations') {
      this.$el.setAttribute('location-id', urlElements[4]);
      // Trigger the corresponding store action or mutation
      this.$store.dispatch('setLocation', urlElements[4]);
    }

    if (urlElements.length === 4 && urlElements[1] === 'appointment' && urlElements[2] === 'confirm') {
      this.$el.setAttribute('confirm-appointment-hash', urlElements[3]);
      // Trigger the confirmReservation store action
      this.$store.dispatch('confirmReservation', { appointmentHash: urlElements[3] }).then((success) => {
        console.log("success", success);
        if (success) {
          this.$store.state.activatedAppointment = success;
        } else {
          this.$store.dispatch('setUpAppointment', { appointmentHash: urlElements[3] });
        }

        this.$store.state.openedPanel = 3;
        this.$store.state.confirmedAppointment = true;
      });
    }

    if (urlElements.length === 3 && urlElements[1] === 'appointment') {
      this.$el.setAttribute('appointment-hash', urlElements[2]);
      // Trigger the corresponding store action or mutation
      this.$store.dispatch('setAppointment', urlElements[2]);
    }


    this.loadStylesHackyWay();
    this.$store.state.settings.endpoints["VUE_APP_ZMS_API_BASE"] = `${process.env.VUE_APP_API_URL}`

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
  },
  methods: {
    loadStylesHackyWay() {
      const styles = [
        `${this.linkBaseUrl}css/vuetify.min.css`,
        `${this.linkBaseUrl}css/materialdesignicons.min.css`,
        `${this.linkBaseUrl}css/style.css`,
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
      }).catch((error) => {
        console.error('Error loading styles:', error);
      });
    }
  },
})


export default class App extends Vue {


}
</script>

<style>

</style>
