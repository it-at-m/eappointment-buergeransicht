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
                }, (errors) => {
                    reject(errors)
                })
        })
    },
    setUpCaptchaDetails(store) {
        return new Promise((resolve, reject) => {
            store.dispatch('API/fetchCaptchaDetails')
                .then(data => {
                    store.commit('setCaptchaDetails', data);
                    resolve(data);
                })
                .catch(errors => {
                    store.commit('setError', 'captcha-details-error');
                    reject(errors);
                });
        });
    },
    setUpServicesAndProviders(store, { preselectedService, preselectedProvider }) {
        return new Promise((resolve) => {
            store.dispatch('API/fetchServicesAndProviders', { serviceId: preselectedService, locationId: preselectedProvider })
                .then(data => {
                    // Check if the requested service exists
                    const serviceExists = data.services.some(service => parseInt(service.id) === parseInt(preselectedService));
                    if (preselectedService && !serviceExists) {
                        store.commit('setError', 'not-found');
                        return;
                    }

                    // Check if the requested provider exists
                    const providerExists = data.offices.some(office => parseInt(office.id) === parseInt(preselectedProvider));
                    if (preselectedProvider && !providerExists) {
                        store.commit('setError', 'not-found');
                        return;
                    }

                    let providers = data.offices
                    const exclusiveProviders = data.offices.filter(office => {
                        return parseInt(office.id) === parseInt(preselectedProvider) && ! office.showAlternativeLocations
                    })

                    if (exclusiveProviders.length) {
                        providers = exclusiveProviders
                    }
                    store.commit('setProviders', providers)
    
                    let requests = data.services.map(service => {
                        service.providers = []
                        service.minSlots = {}
                        let index = 0
    
                        data.relations.forEach(relation => {
                            if (parseInt(relation.serviceId) === parseInt(service.id)) {
                                service.minSlots[relation.officeId] = relation.slots
                                const foundProviders = providers.filter(office => {
                                    return parseInt(office.id) === parseInt(relation.officeId)
                                })

                                if (foundProviders.length == 0) {
                                    return
                                }

                                const foundProvider = foundProviders[0]
    
                                foundProvider.index = index
                                index++
    
                                foundProvider.slots = relation.slots
                                service.providers.push(foundProvider)
                            }
                        })
    
                        return service
                    })
                    store.commit('setServices', requests)
                    store.commit('selectProviderWithId', parseInt(preselectedProvider))
    
                    if (preselectedService !== null) {
                        store.commit('data/reset')
                        store.commit('selectServiceWithId', { id: parseInt(preselectedService) })
                    }
    
                    resolve()
                })
                .catch(() => {
                    store.commit('setError', 'not-found');
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
        } catch (errors) {
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
        } catch (errors) {
            store.state.errorCode = 'appointmentDoesntExist'
            return
        }

        store.dispatch('API/fetchAppointment', { processId: appointmentData.id, authKey: appointmentData.authKey, scope: appointmentData.scope })
            .then(data => {
                if (data.errors && Array.isArray(data.errors) && data.errors[0] && data.errors[0].errorMessage) {
                    store.state.errorMessage = data.errors[0].errorMessage

                    return
                }

                store.dispatch('setAppointmentFromResponse', data)

                if (data.timestamp < moment().unix()) {
                    store.state.errorCode = 'appointmentCanNotBeCanceled'
                }
            })
    },
    setAppointmentFromResponse (store, appointmentData) {
        store.commit('selectProviderWithId', appointmentData.officeId)
        store.commit('selectServiceWithId', {
            id: appointmentData.serviceId,
            count: appointmentData.serviceCount,
            subServiceCounts: appointmentData.subRequestCounts
        })

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