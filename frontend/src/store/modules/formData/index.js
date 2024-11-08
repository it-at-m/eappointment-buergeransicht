import actions from './actions.js'
import mutations from './mutations.js'

const state = {
    service: null,
    providers: [],
    captchaDetails: [],
    appointment: null,
    appointmentCounts: {},
    selectedServices: '',
    selectedProvider: null,
    appointmentCount: 1,
    maxSlotsExceeded: false,
    customer: {
        name: null,
        email: null,
        dataProtection: null
    }
}

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters: {}
}