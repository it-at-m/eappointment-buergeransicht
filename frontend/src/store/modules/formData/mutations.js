const MAX_SLOTS = 25

const checkMaxSlots = (state) => {
    let minSlots = 0
    for (var selectedServiceId in state.appointmentCounts) {
        minSlots += state.appointmentCounts[selectedServiceId] * state.servicesById[selectedServiceId].minSlots
    }

    if (minSlots > MAX_SLOTS) {
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