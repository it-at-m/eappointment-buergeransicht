<template>
  <div>
    <v-container>
      <v-row class="content" v-if="showLanguageSwitch">
        <v-col cols="12">
          <SwitchLanguage />
        </v-col>
      </v-row>

      <v-alert v-if="maintenanceMode" border="right" color="blue-grey" dark>
        {{ $t('maintenanceMode') }}
      </v-alert>

      <v-row class="content" v-else>
        <v-col cols="12">

          <InfoMessage
              v-if="$store.state.displayInfo"
              :type="'default'"
              :text="$store.state.displayInfo"
              :tabindex="5"
          ></InfoMessage>

          <div class="appointment-number" v-if="$store.state.preselectedAppointment" tabindex="1">
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
                          <b tabindex="2">{{ getSelectedServices() }}</b>
                        </span>
                      </v-fade-transition>
                    </v-col>
                  </v-row>
                </template>

                {{ $t('services') }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <ServiceFinder
                  @next="openPanel(2)"
                  @changed="openPanel(1)"
                  @captchaTokenChanged="onCaptchaTokenChanged"
                />
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
                          <b tabindex="3">{{ getSelectedAppointment() }}</b>
                        </span>
                      </v-fade-transition>
                    </v-col>
                  </v-row>
                </template>

                {{ $t('appointment') }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <TheCalendar
                  v-if="$store.state.step >= 2"
                  @next="openPanel(3)"
                  :key="$store.state.data.selectedServices"
                  :captcha-token="captchaToken"
                />
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
                            <b tabindex="4">{{ $store.state.data.customer.name }} ({{ $store.state.data.customer.email }}<span
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
                  <p tabindex="0">{{ $t('pleaseCheckOnceAgain') }}</p>
                </div>
              </div>

              <button
                class="m-button m-button--primary m-button--animated-right button-submit"
                color="white"
                @click="submit"
                tabindex="0"
              >
                <span>{{ $t('confirmAppointment') }}</span>
                <svg aria-hidden="true" class="m-button__icon">
                  <use xlink:href="#icon-arrow-right"></use>
                </svg>
              </button>

            </span>

            <span v-if="appointmentCanBeStartedOver">
              <v-dialog v-model="starOverDialog" persistent max-width="290">
                <template v-slot:activator="{ on, attrs }">
                  <button
                    v-if="!$store.state.isRebooking"
                    class="m-button m-button--secondary m-button--animated-right button-submit"
                    v-bind="attrs"
                    v-on="on"
                    tabindex="0"
                  >
                    <span>{{ $t('cancel') }}</span>
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
                    <div :class="['m-callout', 'm-callout--' + (confirmedAppointment ? 'default' : 'warning') ]">
                      <div class="m-callout__inner">
                        <div class="m-callout__icon">
                          <svg aria-hidden="true" class="icon">
                            <use xlink:href="#icon-information"></use>
                          </svg>
                          <span class="visually-hidden"></span>
                        </div>
                        <div class="m-callout__body">
                          <div class="m-callout__body__inner">
                            <h2
                              tabindex="0"
                              class="m-callout__headline appointment-confirmation">
                              {{ confirmedAppointment ? $t('appointmentIsPreconfirmed'): $t('errorTryAgainLater') }}
                            </h2>
                            <div class="m-callout__content appointment-confirmation-notice"
                              v-if="!appointmentCancelled && confirmedAppointment !== null && $store.state.preselectedAppointment === null && $store.state.data.appointment !== null"
                              :color="confirmedAppointment ? $store.state.settings.theme.notice : $store.state.settings.theme.error">
                              <p tabindex="0">{{ confirmedAppointment? $t('appointmentPreconfirmedNotice'): $t('errorTryAgainLater')
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

            <InfoMessage
                v-if="activatedAppointment && !appointmentCancelled"
                :type="'success'"
                :title="$t('appointmentIsConfirmed')"
                :text="$t('appointmentIsConfirmedDescription')"
                :tabindex="5"
            ></InfoMessage>

            <InfoMessage
                v-if="appointmentCancelled === true"
                :type="'success'"
                :title="$t('appointmentIsCanceled')"
                :text="$t('appointmentIsCanceledDescription')"
                :tabindex="5"
            ></InfoMessage>

            <div class="m-banner m-banner--success appointment-cancel" role="alert" aria-label="Warnung"
                 v-if="appointmentCancelled === false"
                 :color="$store.state.settings.theme.error">
              <div class="container-fluid">
                <svg aria-hidden="true" class="icon">
                  <use xlink:href="#icon-warning"></use>
                </svg>
                <p tabindex="5">{{ $t('appointmentCanNotBeCanceled') }}</p>
              </div>
            </div>

            <button v-if="$store.state.isRebooking"
              class="m-button m-button--secondary m-button--animated-right button-submit" @click="stopRebooking">
              <span tabindex="6">{{ $t('cancel') }}</span>
            </button>
            <div
              v-if="$store.state.preselectedAppointment !== null && $store.state.errorMessage === null && !$store.state.isRebooking">
              <v-dialog v-model="rebookDialog" persistent max-width="290">
                <template v-slot:activator="{ on, attrs }">
                  <button
                    class="m-button m-button--primary m-button--animated-right button-submit"
                    v-if="appointmentCancelled === null && $store.state.errorCode !== 'appointmentCanNotBeCanceled'"
                    v-bind="attrs"
                    v-on="on"
                    tabindex="6"
                  >
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
                    <button class="m-button m-button--primary m-button--animated-right button-yes" @click="startRebooking">
                      <span>{{ $t('yes') }}</span>
                      <svg aria-hidden="true" class="m-button__icon">
                        <use xlink:href="#icon-arrow-right"></use>
                      </svg>
                    </button>
                    <button class="m-button m-button--secondary m-button--animated-right"
                      @click="rebookDialog = false">
                      <span>{{ $t('no') }}</span>
                    </button>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="cancelDialog" persistent max-width="290">
                <template v-slot:activator="{ on, attrs }">

                  <button
                    v-if="appointmentCancelled === null && $store.state.errorCode !== 'appointmentCanNotBeCanceled'"
                    class="m-button m-button--primary m-button--animated-right button-submit"
                    v-bind="attrs"
                    v-on="on"
                    tabindex="6"
                  >
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
                    <button class="m-button m-button--primary m-button--animated-right button-yes" @click="cancelAppointment">
                      <span>{{ $t('yes') }}</span>
                      <svg aria-hidden="true" class="m-button__icon">
                        <use xlink:href="#icon-arrow-right"></use>
                      </svg>
                    </button>
                    <button class="m-button m-button--secondary m-button--animated-right"
                      @click="cancelDialog = false">
                      <span>{{ $t('no') }}</span>
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
import InfoMessage from './InfoMessage.vue'
import TheCalendar from './TheCalendar.vue'
import CustomerInfo from './CustomerInfo.vue'
import moment from "moment"

export default {
  name: 'AppointmentForm',
  components: {
    SwitchLanguage,
    ServiceFinder,
    InfoMessage,
    TheCalendar,
    CustomerInfo
  },
  data: () => ({
    rebookDialog: false,
    cancelDialog: false,
    starOverDialog: false,
    appointmentCancelled: null,
    showLanguageSwitch: false,
    captchaToken: null
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
    },
    maintenanceMode () {
      return this.$store.state.maintenanceMode
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
      this.$store.commit('data/setService', { service: null, provider: null })
      this.$store.state.confirmedAppointment = null
      this.starOverDialog = false

      this.openPanel(1)
    },
    submit() {
      this.disabled = true
      this.$store.dispatch('API/preconfirmReservation', this.$store.state.data.appointment)
        .then(() => {
          if (this.$store.state.isRebooking) {
            this.cancelAppointment(true)
          }
        })
        .then(() => {
          this.$store.state.confirmedAppointment = true
        }, () => {
          this.disabled = false
          this.$store.state.confirmedAppointment = false
        })
        .catch(error => {
          if (error.errors && Array.isArray(error.errors)) {
            this.dateError = error.errors[0]?.errorMessage || this.$t('applicationError');
          } else {
            this.dateError = this.$t('networkError');
          }
        });
    },
    openPanel(step) {
      this.$store.commit('goToStep', step)
      this.$store.state.openedPanel = step - 1
    },
    getSelectedServices() {
      let services = [];

      if (!this.$store.state.data.service) {
        return "";
      }

      const mainServiceCount =
          this.$store.state.data.appointmentCounts[this.$store.state.data.service.id] || 0;
      if (mainServiceCount > 0) {
        services.push(
            mainServiceCount +
            " x " +
            this.$store.state.servicesById[this.$store.state.data.service.id].name
        );
      }

      if (this.$store.state.data.service.subServices) {
        this.$store.state.data.service.subServices.forEach((subService) => {
          const subServiceCount =
              this.$store.state.data.appointmentCounts[subService.id] || 0;
          if (subServiceCount > 0) {
            services.push(
                subServiceCount +
                " x " +
                this.$store.state.servicesById[subService.id].name
            );
          }
        });
      }

      return services.join(", ");
    },
    getSelectedAppointment() {
      const appointment = this.$store.state.data.appointment

      if (!appointment || !appointment.timestamp) {
        return ''
      }

      return moment.unix(appointment.timestamp).tz('Europe/Berlin').format('DD.MM.YYYY H:mm') + ' ' + this.getProviderName(appointment.locationId)
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
    },
    onCaptchaTokenChanged(token) {
      this.captchaToken = token
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