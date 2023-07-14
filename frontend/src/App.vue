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
  props: ['serviceId', 'locationId', 'appointmentHash', 'confirmAppointmentHash'],
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


export default  class App extends Vue{


}
</script>

<style>

</style>
