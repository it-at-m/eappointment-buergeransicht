<template>
  <div>
    <v-autocomplete class="align-content-start service-finder-select" v-model="$store.state.data.service"
      v-if="! $store.state.preselectedService" :attach="$parent.$el" :items="services" :item-text="'name'" return-object
      :label="$t('services')" filled @change="onChange" v-on:keyup.enter="suggest" clearable
      :prepend-inner-icon="searchSvg" ref="autocomplete" :menu-props="{ auto: true, overflowY: true }"
      :no-data-text="$t('noServiceFound')"></v-autocomplete>
    <div v-if="this.filteredServices && this.filteredServices.length === 0"
      class="m-component m-component-callout m-component-callout--warning m-component-callout--fullwidth">
      <div>
        <div class="m-component__grid">
          <div class="m-component__column">
            <div class="m-callout m-callout--warning">
              <div class="m-callout__inner">
                <div class="m-callout__icon">
                  <svg aria-hidden="true" class="icon">
                    <use xlink:href="#icon-warning"></use>
                  </svg>
                  <span class="visually-hidden"></span>
                </div>
                <div class="m-callout__body">
                  <div class="m-callout__body__inner">
                    <div class="m-callout__content">
                      <p>{{ noServiceFound }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-list two-line v-else>
      <template v-for="(filteredService) in this.filteredServices">
        <v-list-item class="filtered-service" :key="filteredService.id" @click="onChange(filteredService)">
          <v-list-item-avatar rounded="0">
            <v-icon>{{ serviceSvg }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-html="filteredService.name"></v-list-item-title>
            <v-list-item-subtitle v-html="filteredService.group"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider :key="'devider' + filteredService.id"></v-divider>
      </template>
    </v-list>

    <v-container v-if="$store.state.data.service">
      <h2>{{ $store.state.data.service.name }}</h2>
      <div v-if="$store.state.data.service.content" v-html="$store.state.data.service.content">
      </div>

      <h3 class="subservices-title">{{ $t('services') }}</h3>
      <v-list two-line class="subservices">
        <v-list-item :key="$store.state.data.service.id + ' ' + appointmentCountTriggered">
          <v-card-actions>
            <v-btn ref="buttonDown" class="appointment-count-button button-down"
              :aria-label="`Anzahl der Dienstleistung verringern auf ` + (appointmentCounts[$store.state.data.service.id] - 1)"
              :aria-describedby="`appointment-count-name-` + $store.state.data.service.id"
              :disabled="!canDecreaseAppointments($store.state.data.service)" fab
              @click="decreaseAppointments($store.state.data.service)">
              <v-icon>{{ minusSvg }}</v-icon>
            </v-btn>
            <h3 tabindex="0"
              :aria-label="`Akuelle Anzahl ausgewählter Dienstleistungen ` + appointmentCounts[$store.state.data.service.id]"
              class="appointment-count" :key="appointmentCounts[$store.state.data.service.id]">
              {{ appointmentCounts[$store.state.data.service.id] }}
            </h3>
            <v-btn id="button-up" ref="buttonUp" class="appointment-count-button"
              :aria-label="`Anzahl der Dienstleistung erhöhen auf` + (appointmentCounts[$store.state.data.service.id] + 1)"
              :aria-describedby="`appointment-count-name-` + $store.state.data.service.id"
              :disabled="!canIncreaseAppointments($store.state.data.service)" fab
              @click="increaseAppointments($store.state.data.service)">
              <v-icon>{{ plusSvg }}</v-icon>
            </v-btn>
          </v-card-actions>
          <span :id="`appointment-count-name-` + $store.state.data.service.id">
            {{ $store.state.data.service.name }}
          </span>
        </v-list-item>

        <template v-if="$store.state.data.service.subServices">
          <h3 tabindex="0" v-if="$store.state.data.service.subServices.length">{{ $t('oftenBookedTogether') }}</h3>

          <template v-for="(subService) in filteredSubServices()">
            <v-list-item :key="subService.id + ' ' + appointmentCountTriggered">
              <v-card-actions>
                <v-btn ref="buttonDown" class="appointment-count-button button-down"
                  :aria-label="`Anzahl der Dienstleistung verringern auf ` + (appointmentCounts[subService.id] - 1)"
                  :aria-describedby="`appointment-count-name-` + subService.id"
                  :disabled="!canDecreaseAppointments(subService)" fab @click="decreaseAppointments(subService)">
                  <v-icon>{{ minusSvg }}</v-icon>
                </v-btn>
                <h3 tabindex="0"
                  :aria-label="getServiceName(subService.id) + ` Anzahl: ` + appointmentCounts[subService.id]"
                  class="appointment-count" :key="appointmentCounts[subService.id]">
                  {{ appointmentCounts[subService.id] }}
                </h3>
                <v-btn id="button-up" ref="buttonUp" class="appointment-count-button"
                  :aria-label="`Anzahl der Dienstleistung erhöhen auf ` + (appointmentCounts[subService.id] + 1)"
                  :aria-describedby="`appointment-count-name-` + subService.id"
                  :disabled="!canIncreaseAppointments(subService)" fab @click="increaseAppointments(subService)">
                  <v-icon>{{ plusSvg }}</v-icon>
                </v-btn>
              </v-card-actions>
              <span :id="`appointment-count-name-` + subService.id">
                {{ getServiceName(subService.id) }}
              </span>
            </v-list-item>
          </template>
        </template>
      </v-list>
      <div v-if="$store.state.data.maxSlotsExceeded"
        class="m-component m-component-callout m-component-callout--warning m-component-callout--fullwidth appointment-cancel">
        <div>
          <div class="m-component__grid">
            <div class="m-component__column">
              <div class="m-callout m-callout--warning">
                <div class="m-callout__inner">
                  <div class="m-callout__icon">
                    <svg aria-hidden="true" class="icon">
                      <use xlink:href="#icon-warning"></use>
                    </svg>
                    <span class="visually-hidden"></span>
                  </div>
                  <div class="m-callout__body">
                    <div class="m-callout__body__inner">
                      <div class="m-callout__content">
                        <p>{{ $t('AppointmentToLong') }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button class="m-button m-button--primary m-button--animated-right button-next" color="white" @click="nextStep"
        :disabled="!$store.state.data.service || $store.state.data.appointmentCount === 0 || $store.state.data.maxSlotsExceeded">
        <span>{{ $t('nextToAppointment') }}</span>
        <svg aria-hidden="true" class="m-button__icon">
          <use xlink:href="#icon-arrow-right"></use>
        </svg>
      </button>
    </v-container>
  </div>
</template>

<script>
import { mdiDomain, mdiMagnify, mdiPlus, mdiMinus } from '@mdi/js'

export default {
  name: 'ServiceFinder',
  computed: {
    appointmentCounts() {
      return this.$store.state.data.appointmentCounts
    },
    services() {
      let allServices = []

      this.$store.state.services.forEach((service) => {
        allServices.push(service)

        if (service.subServices) {
          service.subServices.forEach((subService) => {
            allServices.push(subService)
          })
        }
      })

      return allServices
    }
  },
  props: [
    'serviceId'
  ],
  data: function () {
    return {
      filteredServices: null,
      filteredSubServices: null,
      serviceSvg: mdiDomain,
      searchSvg: mdiMagnify,
      plusSvg: mdiPlus,
      minusSvg: mdiMinus,
      appointmentCountTriggered: 0,
    }
  },
  methods: {
    nextStep() {
      this.$emit('next')
    },
    increaseAppointments(service) {
      this.$emit('changed')
      this.$store.commit('data/increaseAppointmentCount', service.id)
      this.appointmentCountTriggered++
    },
    decreaseAppointments(service) {
      this.$emit('changed')
      this.$store.commit('data/decreaseAppointmentCount', service.id)
      this.appointmentCountTriggered++
    },
    canIncreaseAppointments(service) {
      if (this.$store.state.data.appointmentCounts[service.id] + 1
        > this.$store.state.data.servicesById[service.id].maxQuantity
      ) {
        return false
      }

      return true
    },
    canDecreaseAppointments(service) {
      if (this.$store.state.data.appointmentCounts[service.id] - 1 < 0) {
        return false
      }

      return true
    },
    onChange(value) {
      if (!value) {
        return
      }

      this.$store.commit('data/setService', value)
      this.filteredServices = null

      value.subservices.filter(subservice => {
        let providerIds = subservice.providers.map(provider => provider.id)
        if (this.$store.state.preselectedProvider) {
          return providerIds.includes(this.$store.state.preselectedProvider)
        }

        return true
      })

      this.$emit('changed')
    },
    getServiceName(serviceId) {
      return this.$store.state.servicesById[serviceId].name
    },
    shouldShowService(serviceId) {
      let service = this.$store.state.servicesById[serviceId]
      let providerIds = service.providers.map(provider => provider.id)

      if (this.$store.state.preselectedProvider) {
        return providerIds.includes(this.$store.state.preselectedProvider)
      }

      return true
    },
    suggest(event) {
      if (!event.target.value) {
        return
      }

      this.filteredServices = this.$store.state.services.filter(item => {
        const containsService = item.name.toLowerCase().includes(event.target.value.toLowerCase())
        let containsSubService = false

        if (item.subServices) {
          item.subServices.forEach((subService) => {
            if (subService.name.toLowerCase().includes(event.target.value.toLowerCase())) {
              containsSubService = true
            }
          })
        }

        return containsService || containsSubService
      })

      this.$refs.autocomplete.isMenuActive = false
    }
  },
  mounted() {
    this.$store.commit('data/reset')
    this.$store.commit('selectServiceWithId', { id: this.serviceId })
  }
}
</script>
<style scoped>
.button-next {
  margin-top: 4rem;
}

.filtered-service {
  cursor: pointer;
}

.subservices .v-list-item {
  border-bottom: #ccc solid 1px;
  padding-left: 0;
}

.subservices .v-card__actions {
  padding-left: 0;
}

.subservices-title {
  margin-top: 2rem;
}

.v-menu__content {
  margin-left: 1rem;
}

.appointment-count {
  margin: 0 0.5rem;
}

.appointment-count-button {
  height: 2rem !important;
  width: 2rem !important;
}

.appointment-count-button .v-icon {
  height: 1rem !important;
  width: 1rem !important;
}
</style>