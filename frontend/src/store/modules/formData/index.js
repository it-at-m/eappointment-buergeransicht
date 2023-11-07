import actions from './actions.js'
import mutations from './mutations.js'

const state = {
    service: null,
    providers: [],
    appointment: null,
    appointmentCounts: {},
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