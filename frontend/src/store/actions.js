import moment from "moment"

export default {
    updateAppointmentData(store, appointment) {
        return new Promise((resolve, reject) => {
            appointment.familyName = appointment.client.name
            appointment.email = appointment.client.email
            appointment.telephone = appointment.client.telephone
            appointment.customTextfield = appointment.client.customTextfield

            store.dispatch('API/updateAppointmentData', appointment)
                .then((data) => {
                    appointment.data = data
                    store.commit('data/setCustomerData', appointment.client)
                    store.commit('data/setAppointment', appointment)

                    resolve(true)
                }, (error) => {
                    console.log(error)
                    reject(error)
                })
        })
    },
    setUpServicesAndProviders(store, { preselectedService, preselectedProvider }) {
        return new Promise((resolve) => {
            store.dispatch('API/fetchServicesAndProviders')
                .then(data => {

                    store.commit('setProviders', data.offices)

                    let requests = data.services.map(service => {
                        service.providers = []
                        let index = 0
                        let foundProvider = null

                        data.relations.forEach(relation => {
                            if (relation.serviceId === service.id) {
                                service.minSlots = service.minSlots
                                    ? Math.min(service.minSlots, relation.slots)
                                    : relation.slots
                                foundProvider = data.offices.filter(office => {
                                    console.log(preselectedProvider)
                                    console.log('-')
                                    console.log(relation.officeId)
                                    return office.id === relation.officeId
                                        && (
                                            ! preselectedProvider
                                            || parseInt(preselectedProvider) === parseInt(relation.officeId)
                                        )
                                })[0]

                                if (! foundProvider) {
                                    return
                                }

                                console.log('FOUND')
                                console.log(foundProvider.id)

                                foundProvider.index = index
                                index++

                                foundProvider.slots = relation.slots
                                service.providers.push(foundProvider)
                            }
                        })

                        if (! foundProvider) {
                            return null
                        }

                        return service
                    })
                    store.commit('setServices', requests.filter(request => request))

                    if (preselectedService !== null) {
                        store.commit('data/reset')
                        store.commit('selectServiceWithId', { id: preselectedService })
                    }

                    store.commit('selectProviderWithId', preselectedProvider)

                    resolve()
                })
        })
    },
    confirmReservation(store, { appointmentHash }) {
        let appointmentData = null

        try {
            appointmentData = JSON.parse(window.atob(appointmentHash))
            if (typeof appointmentData.id === undefined || typeof appointmentData.authKey === undefined || typeof appointmentData.scope === undefined) {
                store.state.errorCode = 'appointmentDoesntExist'
                return
            }
        } catch (error) {
            store.state.errorCode = 'appointmentDoesntExist'
            return
        }

        return new Promise((resolve) => {
            store.dispatch('API/confirmReservation', { processId: appointmentData.id, authKey: appointmentData.authKey, scope: appointmentData.scope })
                .then((data) => {
                    store.dispatch('setAppointmentFromResponse', data)

                    resolve(true)
                }, () => {
                    resolve(false)
                })
        })
    },
    setUpAppointment(store, { appointmentHash }) {
        let appointmentData = null

        try {
            appointmentData = JSON.parse(window.atob(appointmentHash))

            if (typeof appointmentData.id === undefined || typeof appointmentData.authKey === undefined  || typeof appointmentData.scope === undefined) {
                store.state.errorCode = 'appointmentDoesntExist'
                return
            }
        } catch (error) {
            store.state.errorCode = 'appointmentDoesntExist'
            return
        }

        store.dispatch('API/fetchAppointment', { processId: appointmentData.id, authKey: appointmentData.authKey, scope: appointmentData.scope })
            .then(data => {
                if (data.errorMessage) {
                    store.state.errorMessage = data.errorMessage

                    return
                }

                store.dispatch('setAppointmentFromResponse', data)

                if (data.timestamp < moment().unix()) {
                    store.state.errorCode = 'appointmentCanNotBeCanceled'
                }
            })
    },
    setAppointmentFromResponse (store, appointmentData) {
        store.commit('selectServiceWithId', {
            id: appointmentData.serviceId,
            count: appointmentData.serviceCount,
            subServiceCounts: appointmentData.subRequestCounts
        })
        store.commit('selectProviderWithId', appointmentData.officeId)

        const customer = {
            name: appointmentData.familyName,
            email: appointmentData.email,
            telephone: appointmentData.telephone,
            customTextfield: appointmentData.customTextfield,
            dataProtection: true
        }

        const appointment = {
            timestamp: appointmentData.timestamp,
            dateFrom: moment.unix(appointmentData.timestamp),
            locationId: appointmentData.officeId,
            location: appointmentData.officeName,
            processId: appointmentData.processId,
            authKey: appointmentData.authKey,
            scope: appointmentData.scope,
            serviceId: appointmentData.serviceId,
            serviceCount: appointmentData.serviceCount,
            ...customer
        }

        store.commit('data/setCustomerData', customer)
        store.commit('preselectAppointment', appointment)
        store.commit('data/setAppointment', appointment)
    },
    startRebooking (store) {
        store.state.isRebooking = true
        store.state.preselectedProvider = null
        store.state.step = 2
        store.state.openedPanel = 1
        store.state.confirmedAppointment = null
        store.state.activatedAppointment = null
    },
    stopRebooking (store) {
        store.state.isRebooking = false
        store.state.step = 3
        store.state.openedPanel = 3
        store.state.confirmedAppointment = true

        store.commit('selectProviderWithId', store.state.preselectedAppointment.providerId)
        store.commit('data/setAppointment', store.state.preselectedAppointment)
    }
}