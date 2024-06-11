import Vuex from 'vuex'
import Vue from "vue";
import FormData from "./modules/formData/index.js"
import Api from "./modules/api/index.js"
import actions from './actions.js'
import mutations from './mutations.js'

Vue.use(Vuex)



const store = new Vuex.Store({
    state: {
        services: [],
        servicesById: {},
        locale: 'de',
        step: 1,
        openedPanel: 0,
        maintenanceMode: false,
        confirmedAppointment: null,
        activatedAppointment: null,
        isRebooking: false,
        preselectedProvider: null,
        preselectedService: null,
        preselectedAppointment: null,
        providers: [],
        captchaDetails: [],
        scope: [],
        error: null,
        errorMessage: null,
        settings: {
            theme: {
                primary: '#005A9F',
                secondary: '#337BB2',
                accent: '#FFE400',
                success: '#90D19C',
                error: '#B71C1C',
                notice: '#607D8B'
            },
            endpoints: {
                'VUE_APP_ZMS_API_BASE': `${process.env.VUE_APP_API_URL}`,
                'VUE_APP_ZMS_API_PROVIDERS_AND_SERVICES_ENDPOINT': '/api/backend/offices-and-services',
                'VUE_APP_ZMS_API_CALENDAR_ENDPOINT': '/api/backend/available-days',
                'VUE_APP_ZMS_API_AVAILABLE_TIME_SLOTS_ENDPOINT': '/api/backend/available-appointments',
                'VUE_APP_ZMS_API_RESERVE_APPOINTMENT_ENDPOINT': '/api/backend/reserve-appointment',
                'VUE_APP_ZMS_API_APPOINTMENT_ENDPOINT': '/api/backend/appointment',
                'VUE_APP_ZMS_API_UPDATE_APPOINTMENT_ENDPOINT': '/api/backend/update-appointment',
                'VUE_APP_ZMS_API_CONFIRM_RESERVATION_ENDPOINT': '/api/backend/confirm-appointment',
                'VUE_APP_ZMS_API_CANCEL_APPOINTMENT_ENDPOINT': '/api/backend/cancel-appointment',
                'VUE_APP_ZMS_API_PRECONFIRM_RESERVATION_ENDPOINT': '/api/backend/preconfirm-appointment',
                'VUE_APP_ZMS_API_CAPTCHA_DETAILS_ENDPOINT': '/api/backend/captcha-details',
                'VUE_APP_ZMS_API_CAPTCHA_VERIFY_ENDPOINT': '/api/backend/captcha-verify'
            }
        }
    },
    actions,
    mutations: {
        ...mutations,
        setError(state, error) {
            state.error = error;
        }
    },
    modules: {
        data: FormData,
        API: Api
    }
})

export default store;