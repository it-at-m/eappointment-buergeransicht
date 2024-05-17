const MAX_SLOTS = 25

const checkMaxSlots = (state) => {
    let minSlots = 0
    let maxSlotsByProviders = 0
    let providerIds = []

    for (var serviceId in state.appointmentCounts) {
        let selectedService = state.servicesById[serviceId]

        if (state.appointmentCounts[serviceId] === 0 || ! selectedService.providers) {
            continue
        }

        let selectedServiceProviderIds = selectedService.providers.map(provider => provider.id)
        if (providerIds.length === 0) {
            providerIds = selectedServiceProviderIds
            continue
        }

        providerIds = providerIds.filter(value => selectedServiceProviderIds.includes(value));
    }

    for (var selectedServiceId in state.appointmentCounts) {
        let selectedService = state.servicesById[selectedServiceId]
        if (state.appointmentCounts[selectedServiceId] === 0 || ! selectedService.providers) {
            continue
        }

        console.log('selectedService providers: ' + selectedService.providers.length)
        let minSlotsForAllProviders = MAX_SLOTS
        if (typeof selectedService.providers !== 'undefined') {
            selectedService.providers.forEach((provider) => {
                if (typeof provider.maxSlotsPerAppointment !== 'undefined'
                    && provider.maxSlotsPerAppointment > 0
                    && providerIds.includes(provider.id)
                ) {
                    maxSlotsByProviders = Math.max(maxSlotsByProviders, parseInt(provider.maxSlotsPerAppointment))
                    console.log('change: ' + maxSlotsByProviders)
                }

                minSlotsForAllProviders = Math.min(minSlotsForAllProviders, selectedService.minSlots[provider.id])
            })
        }
        minSlots += state.appointmentCounts[selectedServiceId] * minSlotsForAllProviders
    }

    let maxSlots = MAX_SLOTS
    if (maxSlotsByProviders > 0) {
        maxSlots = Math.min(maxSlotsByProviders, MAX_SLOTS)
    }

    console.log('min slots: ' + minSlots)
    console.log('max slots: ' + maxSlots)
    if (minSlots > maxSlots) {
        state.maxSlotsExceeded = true
    } else {
        state.maxSlotsExceeded = false
    }
}

const increaseAppointmentCount = (state, serviceId) => {
    if (state.appointmentCounts[serviceId] < state.servicesById[serviceId].maxQuantity)
    {
      state.appointmentCounts[serviceId]++
      state.appointmentCount++
    }

    checkMaxSlots(state)
}

const decreaseAppointmentCount = (state, serviceId) => {
    if (state.appointmentCounts[serviceId] > 0) {
      state.appointmentCounts[serviceId]--
      state.appointmentCount--
    }

    checkMaxSlots(state)
}

export default {
    increaseAppointmentCount,
    decreaseAppointmentCount,
    reset (state) {
        state.service = null
        state.appointment = null
        state.appointmentCounts = {}
        state.appointmentCount = 1
    },
    setService (state, service) {
        state.appointmentCounts = {}
        state.appointmentCount = service && service.count !== undefined ? service.count : 1
        state.service = service

        if (! service) {
            return
        }

        state.appointmentCounts[service.id] = state.appointmentCount

        if (service.combinable === undefined) {
            service.combinable = []

            return
        }

        let combinable = service.combinable
        if (combinable.indexOf(parseInt(service.id) !== -1)) {
            combinable.splice(combinable.indexOf(parseInt(service.id)), 1)
        }

        if (! service.subServices) {
            if (service.subServiceCounts) {
                service.subServices = []
                for (const [subServiceId, subServiceCount] of Object.entries(service.subServiceCounts)) {
                    service.subServices.push({
                        id: parseInt(subServiceId),
                        count: subServiceCount
                    })
                }
            } else {
                service.subServices = combinable.map((subServiceId) => {
                    return {
                        id: subServiceId,
                        count: 0
                    }
                })
            }
        }

        service.subServices.forEach((service) => {
            state.appointmentCounts[service.id] = service.count
        })

        state.service = service
    },
    setAppointment (state, appointment) {
        state.appointment = appointment
    },
    setCustomerData (state, customer) {
        state.customer.name = customer ? customer.name : null
        state.customer.email = customer ? customer.email : null
        state.customer.telephone = customer ? customer.telephone : null
        state.customer.customTextfield = customer ? customer.customTextfield : null
        state.customer.dataProtection = customer ? customer.dataProtection : null
    }
}