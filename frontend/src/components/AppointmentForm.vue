<template>
  <div>
    <v-container>
      <v-row class="content" v-if="showLanguageSwitch">
        <v-col cols="12">
          <SwitchLanguage />
        </v-col>
      </v-row>

      <v-row class="content">
        <v-col cols="12">

          <div class="appointment-number" v-if="$store.state.preselectedAppointment">
            {{ $t('yourAppointmentNumber') }}: <b>{{ $store.state.preselectedAppointment.processId }}</b>
          </div>
          <div v-if="$store.state.errorCode || $store.state.errorMessage"
            class="m-banner m-banner--emergency error-message" role="alert" aria-label="Emergency">
            <div class="container-fluid">
              <svg aria-hidden="true" class="icon">
                <use xlink:href="#icon-warning"></use>
              </svg>
              <p>{{ $store.state.errorMessage ? $store.state.errorMessage : $t($store.state.errorCode) }}</p>
            </div>
          </div>

          <v-expansion-panels v-model="$store.state.openedPanel" accordion>
            <v-expansion-panel id="panel1" :disabled="confirmedAppointment || $store.state.isRebooking">
              <v-expansion-panel-header>
                <template v-slot:default="{ open }">
                  <v-row no-gutters>
                    <v-col cols="12" md="3">
                      {{ $t('stepFrom').replace('{step}', 1).replace('{stepTotal}', 3) }}:<br />{{
                        $t('chooseService')
                      }}
                    </v-col>
                    <v-col cols="12" md="9" class="text--secondary">
                      <v-fade-transition leave-absolute>
                        <span v-if="!open" key="1">
                          <b>{{ getSelectedServices() }}</b>
                        </span>
                      </v-fade-transition>
                    </v-col>
                  </v-row>
                </template>

                {{ $t('services') }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <ServiceFinder @next="openPanel(2)" @changed="openPanel(1)" />
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel id="panel2" :disabled="$store.state.step < 2
              || !$store.state.data.service
              || $store.state.data.appointmentCount === 0
              || this.confirmedAppointment
            ">
              <v-expansion-panel-header>
                <template v-slot:default="{ open }">
                  <v-row no-gutters>
                    <v-col cols="12" md="3">
                      {{ $t('stepFrom').replace('{step}', 2).replace('{stepTotal}', 3) }}:<br />{{
                        $t('chooseAppointment')
                      }}
                    </v-col>
                    <v-col cols="12" md="9" class="text--secondary">
                      <v-fade-transition leave-absolute>
                        <span v-if="!open" key="1">
                          <b>{{ getSelectedAppointment() }}</b>
                        </span>
                      </v-fade-transition>
                    </v-col>
                  </v-row>
                </template>

                {{ $t('appointment') }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <TheCalendar @next="openPanel(3)" :key="$store.state.data.service ? $store.state.data.service.id : 0" />
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel id="panel3" :disabled="$store.state.step < 3 || this.confirmedAppointment">
              <v-expansion-panel-header>
                <template v-slot:default="{ open }">
                  <v-row no-gutters>
                    <v-col cols="12" md="3">
                      {{ $t('stepFrom').replace('{step}', 3).replace('{stepTotal}', 3) }}:<br />{{
                        $t('typeContactData')
                      }}
                    </v-col>
                    <v-col cols="12" md="9" class="text--secondary">
                      <v-fade-transition leave-absolute>
                        <span v-if="!open" key="1">
                          <span v-if="$store.state.data.customer.name">
                            <b>{{ $store.state.data.customer.name }} ({{ $store.state.data.customer.email }}<span
                                v-if="$store.state.data.customer.telephone">, {{
                                  $store.state.data.customer.telephone
                                }}</span><span v-if="$store.state.data.customer.customTextfield">, {{
  $store.state.data.customer.customTextfield
}}</span>)</b>
                          </span>
                        </span>
                      </v-fade-transition>
                    </v-col>
                  </v-row>
                </template>
                {{ $t('contactData') }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <CustomerInfo @next="openPanel(4)" @changed="openPanel(3)" />
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>

          <div class="confirm-action">
            <span v-if="appointmentCanBeConfirmed">
              <div class="m-banner m-banner--info" role="dialog" aria-label="Information">
                <div class="container-fluid">
                  <svg aria-hidden="true" class="icon">
                    <use xlink:href="#icon-information"></use>
                  </svg>
                  <p>{{ $t('pleaseCheckOnceAgain') }}</p>
                </div>
              </div>

              <button class="m-button m-button--primary m-button--animated-right button-submit" color="white"
                @click="submit">
                <span>{{ $store.state.isRebooking ? $t('rebookAppointment') : $t('confirmAppointment') }}</span>
                <svg aria-hidden="true" class="m-button__icon">
                  <use xlink:href="#icon-arrow-right"></use>
                </svg>
              </button>

            </span>

            <span v-if="appointmentCanBeStartedOver">
              <v-dialog v-model="starOverDialog" persistent max-width="290">
                <template v-slot:activator="{ on, attrs }">
                  <button v-if="!$store.state.isRebooking"
                    class="m-button m-button--secondary m-button--animated-right button-submit" v-bind="attrs"
                    v-on="on">
                    <span>{{ $t('cancel') }}</span>
                    <svg aria-hidden="true" class="m-button__icon">
                      <use xlink:href="#icon-arrow-right"></use>
                    </svg>
                  </button>
                </template>
                <v-card>
                  <div class="popup-content">
                    {{ $t('wantToStartOverAppointment') }}<br>
                    {{ $t('currentAppointmentWillBeCanceled') }}
                  </div>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <button class="m-button m-button--primary m-button--animated-right button-yes" @click="startOver">
                      <span>{{ $t('yes') }}</span>
                      <svg aria-hidden="true" class="m-button__icon">
                        <use xlink:href="#icon-arrow-right"></use>
                      </svg>
                    </button>
                    <button class="m-button m-button--secondary m-button--animated-right"
                      @click="starOverDialog = false">
                      <span>{{ $t('no') }}</span>
                      <svg aria-hidden="true" class="m-button__icon">
                        <use xlink:href="#icon-arrow-right"></use>
                      </svg>
                    </button>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </span>
            <div class="m-component m-component-callout m-component-callout--fullwidth"
              v-if="!appointmentCancelled && confirmedAppointment !== null && $store.state.preselectedAppointment === null && $store.state.data.appointment !== null"
              :color="confirmedAppointment ? $store.state.settings.theme.success : $store.state.settings.theme.error">
              <div>
                <div class="m-component__grid">
                  <div class="m-component__column">
                    <div class="m-callout m-callout--default">
                      <div class="m-callout__inner">
                        <div class="m-callout__icon">
                          <svg aria-hidden="true" class="icon">
                            <use xlink:href="#icon-information"></use>
                          </svg>
                          <span class="visually-hidden"></span>
                        </div>
                        <div class="m-callout__body">
                          <div class="m-callout__body__inner">
                            <h2 class="m-callout__headline appointment-confirmation">{{
                              confirmedAppointment?
                            $t('appointmentIsPreconfirmed'): $t('errorTryAgainLater') }}</h2>
                            <div class="m-callout__content appointment-confirmation-notice"
                              v-if="!appointmentCancelled && confirmedAppointment !== null && $store.state.preselectedAppointment === null && $store.state.data.appointment !== null"
                              :color="confirmedAppointment ? $store.state.settings.theme.notice : $store.state.settings.theme.error">
                              <p>{{ confirmedAppointment? $t('appointmentPreconfirmedNotice'): $t('errorTryAgainLater')
                              }}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="m-banner m-banner--success appointment-activated" role="alert" aria-label="Warnung"
              v-if="activatedAppointment && !appointmentCancelled">
              <div class="container-fluid">
                <svg aria-hidden="true" class="icon">
                  <use xlink:href="#icon-warning"></use>
                </svg>
                <p>{{ $t('appointmentIsConfirmed') }}</p>
              </div>
            </div>
            <div class="m-banner m-banner--success appointment-cancel" role="alert" aria-label="Warnung"
              v-if="appointmentCancelled !== null"
              :color="appointmentCancelled ? $store.state.settings.theme.success : $store.state.settings.theme.error">
              <div class="container-fluid">
                <svg aria-hidden="true" class="icon">
                  <use xlink:href="#icon-warning"></use>
                </svg>
                <p>{{ appointmentCancelled? $t('appointmentCanceled'): $t('appointmentCanNotBeCanceled') }}</p>
              </div>
            </div>
            <button v-if="$store.state.isRebooking"
              class="m-button m-button--secondary m-button--animated-right button-submit" @click="stopRebooking">
              <span>{{ $t('cancel') }}</span>
              <svg aria-hidden="true" class="m-button__icon">
                <use xlink:href="#icon-arrow-right"></use>
              </svg>
            </button>
            <div
              v-if="$store.state.preselectedAppointment !== null && $store.state.errorMessage === null && !$store.state.isRebooking">
              <v-dialog v-model="rebookDialog" persistent max-width="290">
                <template v-slot:activator="{ on, attrs }">
                  <button class="m-button m-button--primary m-button--animated-right button-submit"
                    v-if="appointmentCancelled === null && $store.state.errorCode !== 'appointmentCanNotBeCanceled'"
                    v-bind="attrs" v-on="on">
                    <span>{{ $t('rebookAppointment') }}</span>
                    <svg aria-hidden="true" class="m-button__icon">
                      <use xlink:href="#icon-arrow-right"></use>
                    </svg>
                  </button>

                </template>
                <v-card>
                  <div class="popup-content">
                    {{ $t('wantToRebookAppointment') }}
                  </div>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <button class="m-button m-button--primary m-button--animated-right button-yes" @click="startOver">
                      <span>{{ $t('yes') }}</span>
                      <svg aria-hidden="true" class="m-button__icon">
                        <use xlink:href="#icon-arrow-right"></use>
                      </svg>
                    </button>
                    <button class="m-button m-button--secondary m-button--animated-right"
                      @click="starOverDialog = false">
                      <span>{{ $t('no') }}</span>
                      <svg aria-hidden="true" class="m-button__icon">
                        <use xlink:href="#icon-arrow-right"></use>
                      </svg>
                    </button>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="cancelDialog" persistent max-width="290">
                <template v-slot:activator="{ on, attrs }">

                  <button
                    v-if="appointmentCancelled === null && $store.state.errorCode !== 'appointmentCanNotBeCanceled'"
                    class="m-button m-button--secondary m-button--animated-right button-submit" v-bind="attrs"
                    v-on="on">
                    <span>{{ $t('cancelAppointment') }}</span>
                    <svg aria-hidden="true" class="m-button__icon">
                      <use xlink:href="#icon-arrow-right"></use>
                    </svg>
                  </button>

                </template>
                <v-card>
                  <div class="popup-content">
                    {{ $t('wantToCancelAppointment') }}
                  </div>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <button class="m-button m-button--primary m-button--animated-right button-yes" @click="startOver">
                      <span>{{ $t('yes') }}</span>
                      <svg aria-hidden="true" class="m-button__icon">
                        <use xlink:href="#icon-arrow-right"></use>
                      </svg>
                    </button>
                    <button class="m-button m-button--secondary m-button--animated-right"
                      @click="starOverDialog = false">
                      <span>{{ $t('no') }}</span>
                      <svg aria-hidden="true" class="m-button__icon">
                        <use xlink:href="#icon-arrow-right"></use>
                      </svg>
                    </button>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </div>
          </div>

        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import SwitchLanguage from './SwitchLanguage.vue'
import ServiceFinder from './ServiceFinder.vue'
import TheCalendar from './TheCalendar.vue'
import CustomerInfo from './CustomerInfo.vue'
import moment from "moment"

export default {
  name: 'AppointmentForm',
  components: {
    SwitchLanguage,
    ServiceFinder,
    TheCalendar,
    CustomerInfo
  },
  data: () => ({
    rebookDialog: false,
    cancelDialog: false,
    starOverDialog: false,
    appointmentCancelled: null,
    showLanguageSwitch: false
  }),
  computed: {
    appointmentCanBeConfirmed() {
      return this.$store.state.step === 4 && this.confirmedAppointment === null
    },
    appointmentCanBeStartedOver() {
      return this.$store.state.step === 4 && this.confirmedAppointment === null
    },
    confirmedAppointment() {
      return this.$store.state.confirmedAppointment
    },
    activatedAppointment() {
      return this.$store.state.activatedAppointment
    }
  },
  methods: {
    cancelAppointment(byRebooking = false) {
      if (this.$store.state.preselectedAppointment.dateFrom.unix() < moment().unix()) {
        this.$store.state.errorCode = 'appointmentCanNotBeCanceled'
        return
      }

      this.cancelDialog = false;

      this.$store.dispatch('API/cancelAppointment', this.$store.state.preselectedAppointment)
        .then(() => {
          this.$store.commit('preselectAppointment', null)
          this.appointmentCancelled = byRebooking === true ? null : true

          if (byRebooking) {
            this.$store.state.isRebooking = false
          }
        }, () => {
          this.appointmentCancelled = false
        })
    },
    startRebooking() {
      this.rebookDialog = false

      if (this.$store.state.preselectedAppointment.dateFrom.unix() < moment().unix()) {
        this.$store.state.errorCode = 'appointmentCanNotBeCanceled'
        return
      }

      this.$store.dispatch('startRebooking')
    },
    stopRebooking() {
      this.$store.dispatch('stopRebooking')
    },
    startOver() {
      this.$store.commit('data/setCustomerData', {})
      this.$store.commit('preselectAppointment', null)
      this.$store.commit('data/setAppointment', null)
      this.$store.commit('data/setService', null)
      this.$store.state.confirmedAppointment = null
      this.starOverDialog = false

      this.openPanel(1)
    },
    submit() {
      this.desabled = true
      this.$store.dispatch('API/preconfirmReservation', this.$store.state.data.appointment)
        .then(() => {
          if (this.$store.state.isRebooking) {
            this.cancelAppointment(true)
          }
        })
        .then(() => {
          this.$store.state.confirmedAppointment = true
        }, () => {
          this.desabled = false
          this.$store.state.confirmedAppointment = false
        })
    },
    openPanel(step) {
      this.$store.commit('goToStep', step)
      this.$store.state.openedPanel = step - 1
    },
    getSelectedServices() {
      let services = []

      if (!this.$store.state.data.service) {
        return ''
      }

      services.push(this.$store.state.data.appointmentCounts[this.$store.state.data.service.id] + ' x ' + this.$store.state.servicesById[this.$store.state.data.service.id].name)

      this.$store.state.data.service.subServices.forEach((subService) => {
        if (this.$store.state.data.appointmentCounts[subService.id]) {
          services.push(this.$store.state.data.appointmentCounts[subService.id] + ' x ' + this.$store.state.servicesById[subService.id].name)
        }
      })

      return services.join(', ')
    },
    getSelectedAppointment() {
      const appointment = this.$store.state.data.appointment

      if (!appointment || !appointment.timestamp) {
        return ''
      }

      return moment.unix(appointment.timestamp).format('DD.MM.YYYY H:mm') + ' ' + this.getProviderName(appointment.locationId)
    },
    getProviderName(id) {
      let providerName = ''
      this.$store.state.providers.forEach((provider) => {
        if (provider.id === id) {
          providerName = provider.name
        }
      })

      return providerName
    },
    preselectService(id) {
      this.$store.commit('data/reset')
      this.$store.commit('selectServiceWithId', { id: id })
      this.openPanel(1)
      this.$store.state.confirmedAppointment = null
    }
  }
}
</script>

<style scoped>
#app {
  font-family: Open Sans, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #3a5368;
}

.theme--light.v-application {
  color: #3a5368 !important;
}

.theme--light.v-expansion-panels .v-expansion-panel {
  color: #3a5368 !important;
}

.button-submit {
  margin-right: 1rem;
  margin-top: 1rem;
}

.content {
  margin-top: 20px;
}

.confirm-action {
  margin-top: 2rem;
}

.error-message {
  margin-bottom: 2rem;
}

.v-alert {
  margin: 0 0 20px 0;
}

.appointment-number {
  font-size: 20px;
  padding: 10px 0;
}

.popup-content {
  font-size: 18px;
  padding: 20px;
}
</style>