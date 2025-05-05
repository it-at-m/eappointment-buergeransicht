export default {
    setServices (state, services) {
        state.services = services

        services.forEach((service) => {
            state.servicesById[service.id] = service
        })

        state.data.servicesById = state.servicesById
    },
    setProviders (state, providers) {
        state.providers = providers
    },
    setRelations(state, relations) {
        state.relations = relations;
    },
    setCaptchaDetails(state, captchaDetails) {
        state.captchaDetails = captchaDetails;
    },
    setCaptchaToken(state, captchaToken) {
        state.captchaToken = captchaToken
    },
    setSettings (state, settings) {
        state.settings = settings
    },
    goToStep(state, step) {
        state.step = step
    },
    selectServiceWithId (state, { id, count, subServiceCounts = [] }) {
        const subServiceCountsById = {}

        subServiceCounts.forEach((subService) => {
            subServiceCountsById[subService.id] = subService.count
        })

        state.services.forEach((service) => {
            if (parseInt(service.id) === parseInt(id)) {
                if (count) {
                    service.count = count
                }

                state.preselectedService = id

                if (subServiceCounts.length) {
                    service.subServiceCounts = subServiceCountsById
                }

                if (state.preselectedProvider && ! state.preselectedProvider.showAlternativeLocations) {
                    service.providers = [state.preselectedProvider]
                }

                this.commit('data/setService', { service: service, provider: state.preselectedProvider })
            }
        })
    },
    selectProviderWithId (state, id) {
        state.providers.forEach((provider) => {
            if (parseInt(provider.id) === parseInt(id)) {
                state.preselectedProvider = provider;
            }
        })
    },
    preselectAppointment(state, preselectedAppointment) {
        state.preselectedAppointment = preselectedAppointment
        state.confirmedAppointment = true
    }
}