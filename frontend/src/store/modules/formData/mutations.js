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

        let minSlotsForAllProviders = MAX_SLOTS
        if (typeof selectedService.providers !== 'undefined') {
            selectedService.providers.forEach((provider) => {
                if (! providerIds.includes(provider.id)) {
                    return
                }

                if (typeof provider.maxSlotsPerAppointment !== 'undefined'
                    && provider.maxSlotsPerAppointment > 0)
                {
                    maxSlotsByProviders = Math.max(maxSlotsByProviders, parseInt(provider.maxSlotsPerAppointment))
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
    buildSelectedIds(state)
}

const decreaseAppointmentCount = (state, serviceId) => {
    if (state.appointmentCounts[serviceId] > 0) {
      state.appointmentCounts[serviceId]--
      state.appointmentCount--
    }

    checkMaxSlots(state)
    buildSelectedIds(state)
}

const buildSelectedIds = (state) => {
    let selectedServiceIds = []

    Object.entries(state.appointmentCounts).map(([serviceId, count]) => {
        if (count > 0) {
            selectedServiceIds.push(parseInt(serviceId))
        }
    })

    state.selectedServices = selectedServiceIds.join('-')
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
    setService (state, { service, provider = null }) {
        state.appointmentCounts = {}
        state.appointmentCount = service && service.count !== undefined ? service.count : 1
        state.service = service

        if (! service) {
            return
        }

        state.appointmentCounts[service.id] = state.appointmentCount

        if (service.combinable === undefined) {
            service.combinable = []
            service.subServices = []
            state.service = service

            return
        }

        let combinable = service.combinable
        let orderedServiceIds = []
        
        // Convert new format to old format for compatibility while preserving order
        if (Object.keys(combinable).every(key => !isNaN(parseInt(key)))) {
            const oldFormatCombinable = {}
            // Store the order of services based on the numbered keys
            orderedServiceIds = Object.entries(combinable)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([, entry]) => {
                    const [[serviceId]] = Object.entries(entry)
                    return serviceId
                })
            
            Object.values(combinable).forEach(entry => {
                const [[serviceId, providers]] = Object.entries(entry)
                oldFormatCombinable[serviceId] = providers
            })
            combinable = oldFormatCombinable
        }

        if (typeof combinable[parseInt(service.id)] !== "undefined") {
            delete combinable[parseInt(service.id)]
            orderedServiceIds = orderedServiceIds.filter(id => id !== service.id.toString())
        }

        if (! service.subServices) {
            // Use the ordered service IDs if available, otherwise fallback to Object.entries
            const serviceEntries = orderedServiceIds.length > 0
                ? orderedServiceIds.map(id => [id, combinable[id]])
                : Object.entries(combinable)
                
            service.subServices = serviceEntries.map(([subServiceId, providers]) => {
                return {
                    id: parseInt(subServiceId),
                    count: service.subServiceCounts && service.subServiceCounts[subServiceId]
                        ? service.subServiceCounts[subServiceId]
                        : 0,
                    providers: providers
                }
            }).filter((subservice) => {
                if (provider) {
                    return subservice.providers.includes(parseInt(provider.id))
                }

                return true
            })
        }

        service.subServices.forEach((service) => {
            state.appointmentCounts[service.id] = service.count
            state.selectedServices = service.id + '-'
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
        state.customer.customTextfield2 = customer ? customer.customTextfield2 : null
        state.customer.dataProtection = customer ? customer.dataProtection : null
    }
}