import {mount, shallowMount} from '@vue/test-utils'
import Vuex from 'vuex'
import TheCalendar from './../../src/components/TheCalendar.vue'
import Vuetify from 'vuetify'
import VueI18n from 'vue-i18n'
import translations from './../../src/translations'
import store from './../../src/store'
import Vue from 'vue'
import moment from "moment"
import 'regenerator-runtime/runtime';

Vue.use(VueI18n)
Vue.use(Vuetify)
Vue.use(Vuex)

const i18n = new VueI18n({
    locale: store.state.locale,
    messages: translations,
})

store.dispatch = jest.fn()
window.scrollTo = jest.fn();

store.state.services = [
    {
        id: 1,
        name: "Meldebescheinigung",
        maxQuantity: 3,
        providers: [
            {
                id: 1,
                name: "Provider 1"
            },
            {
                id: 2,
                name: "Provider 2"
            }
        ]
    },
    {
        id: 2,
        name: "Haushaltsbescheinigung",
        maxQuantity: 2,
        providers: [
            {
                id: 1,
                name: "Provider 1"
            },
            {
                id: 2,
                name: "Provider 2"
            }
        ]
    },
    {
        id: 3,
        name: "Fahrzeug wieder anmelden",
        maxQuantity: 2,
        providers: [
            {
                id: 1,
                name: "Provider 1"
            },
            {
                id: 2,
                name: "Provider 2"
            }
        ]
    }
]

store.state.data.servce = {
    id: 1,
    name: "Meldebescheinigung",
    maxQuantity: 3,
    providers: [
        {
            id: 1,
            name: "Provider 1"
        },
        {
            id: 2,
            name: "Provider 2"
        }
    ]
}

const wrapper = mount(TheCalendar, {
    Vue,
    store,
    i18n,
    vuetify: new Vuetify({
        icons: {
            iconfont: 'mdiSvg'
        }
    }),
    propsData: {}
})

describe('Calendar', () => {
    it('Component is shown', () => {
        expect(wrapper.exists()).toBe(true)
    })

    it('providers are shown', async () => {
        wrapper.vm.$store.state.data.service = {
            id: 1,
            name: "Meldebescheinigung",
            maxQuantity: 3,
            providers: [
                {
                    id: 1,
                    name: "Provider 1"
                },
                {
                    id: 2,
                    name: "Provider 2"
                }
            ]
        }

        await wrapper.vm.$nextTick()

        expect(wrapper.html()).toContain('Provider 1')
        expect(wrapper.html()).toContain('tabindex="0" aria-selected="true" role="tab" class="v-tab v-tab--active"')
        expect(wrapper.html()).toContain('Provider 2')
        expect(wrapper.html()).toContain('tabindex="0" aria-selected="false" role="tab" class="v-tab"')
        expect(wrapper.find('.v-tab--active').html()).toContain('Provider 1')
    })

    it('right month is shown', async () => {
        wrapper.vm.date = '2023-04-02'

        await wrapper.vm.$nextTick()
        const weeks = wrapper.findAll('tbody tr')

        expect(weeks.at(0).text()).toContain('12')
        expect(weeks.at(1).text()).toContain('3456789')
        expect(weeks.at(2).text()).toContain('10111213141516')
        expect(weeks.at(3).text()).toContain('17181920212223')
        expect(weeks.at(4).text()).toContain('24252627282930')
    })

    it('right days are available', async () => {
        wrapper.vm.maxDate = new Date('2023-05-30T01:00:00')
        wrapper.vm.selectableDates = [
            '2023-05-20',
            '2023-05-21',
            '2023-05-22'
        ]

        await wrapper.vm.$nextTick()

        expect(wrapper.vm.allowedDates(new Date('2023-05-15T01:00:00'))).toBeFalsy()
        expect(wrapper.vm.allowedDates(new Date('2023-05-20T01:00:00'))).toBeTruthy()
        expect(wrapper.vm.allowedDates(new Date('2023-05-31T01:00:00'))).toBeFalsy()
    })

    it('formatDay returns date in right format', async () => {
        expect(wrapper.vm.formatDay(new Date('2023-05-15T01:00:00'))).toBe('Montag, 15.05.2023')
    })

    it('getAppointmentsOfDay shows dialog with time slots', async () => {
        document.body.setAttribute('data-app', true)
        const moment1 = moment.unix(1684386000)
        const moment2 = moment.unix(1684386900)
        const moment3 = moment.unix(1684387800)
        const mockCallback = jest.fn(() => {
            return new Promise((resolve, reject) => {
                resolve({
                    "appointmentTimestamps": [
                        moment1.unix(),
                        moment2.unix(),
                        moment3.unix()
                    ]
                })
            })
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.getAppointmentsOfDay('2023-05-18')

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.timeSlots.length).toBe(3)
        expect(wrapper.vm.timeSlots[0].format('HH:mm')).toBe(moment1.format('HH:mm'))
        expect(wrapper.vm.timeSlots[1].format('HH:mm')).toBe(moment2.format('HH:mm'))
        expect(wrapper.vm.timeSlots[2].format('HH:mm')).toBe(moment3.format('HH:mm'))
        expect(wrapper.vm.timeDialog).toBeTruthy()
    })

    it('getAppointmentsOfDay shows error', async () => {
        document.body.setAttribute('data-app', true)
        const mockCallback = jest.fn(() => {
            return new Promise((resolve, reject) => {
                resolve({
                    errors: [
                        {
                            errorMessage: 'Something went wrong'
                        }
                    ]
                });
            })
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.getAppointmentsOfDay('2023-05-18')

        await wrapper.vm.$nextTick()

        expect(wrapper.vm.dateError).toBe('Something went wrong')
        expect(wrapper.vm.timeDialog).toBeFalsy()
    })

    it('getAppointmentsOfDay shows error', async () => {
        document.body.setAttribute('data-app', true)
        const mockCallback = jest.fn(() => {
            return new Promise((resolve, reject) => {
                resolve({
                    errors: [
                        {
                            errorMessage: 'Something went wrong'
                        }
                    ]
                });
            })
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.getAppointmentsOfDay('2023-05-18')

        await wrapper.vm.$nextTick()

        expect(wrapper.vm.dateError).toBe('Something went wrong')
        expect(wrapper.vm.timeDialog).toBeFalsy()
    })

    it('showForProvider method fetch and save available days for provider', async () => {
        const mockCallback = jest.fn((method, parameters) => {
            return new Promise((resolve, reject) => {
                resolve({
                    'availableDays': [
                        '2023-05-10',
                        '2023-05-11',
                        '2023-05-12'
                    ]
                })
            })
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.showForProvider({
            id: 1,
            name: "Provider 1"
        })

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(2)
        expect(wrapper.vm.selectableDates).toEqual([
            '2023-05-10',
            '2023-05-11',
            '2023-05-12'
        ])
    })

    it('showForProvider method set error message', async () => {
        const mockCallback = jest.fn((method, parameters) => {
            return new Promise((resolve, reject) => {
                resolve({
                    errors: [
                        {
                            errorMessage: 'Something went wrong'
                        }
                    ]
                });
            })
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.showForProvider({
            id: 1,
            name: "Provider 1"
        })

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.selectableDates).toEqual([])
        expect(wrapper.vm.dateError).toBe("Something went wrong")
    })

    it('chooseAppointment method fails to reserve appointment', async () => {
        const mockCallback = jest.fn((method, parameters) => {
            if (method === 'API/reserveAppointment') {
                return new Promise((resolve, reject) => {
                    resolve({
                        errors: [
                            {
                                'error': 'Failed.'
                            }
                        ]
                    });
                })
            }
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.chooseAppointment(1684386000)

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.timeSlotError).toBe('Etwas ist schief gelaufen. Bitte versuchen Sie es mit einem anderen Termin.')
    })

    it('chooseAppointment method fails to reserve appointment because time slot is not available', async () => {
        const mockCallback = jest.fn((method, parameters) => {
          if (method === 'API/reserveAppointment') {
            return Promise.resolve({
              errors: [
                {
                  errorCode: 'noSlots',
                  errorMessage:
                    'Leider gibt es zu Ihrer Leistung aktuell keine freien Termine.\n' +
                    'Versuchen Sie es bitte ein andermal noch einmal.',
                },
              ],
            })
          }
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.chooseAppointment(1684386000)

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.timeSlotError).toBe(
            'Leider gibt es zu Ihrer Leistung aktuell keine freien Termine.\n' +
            'Versuchen Sie es bitte ein andermal noch einmal.'
          )
        expect(wrapper.emitted().next).not.toBeDefined()
    })

    it('chooseAppointment method reserves appointment', async () => {
        const mockCallback = jest.fn((method, parameters) => {
            if (method === 'API/reserveAppointment') {
                return new Promise((resolve, reject) => {
                    resolve({
                        'provider': 111,
                        'officeName': 'Office name',
                        'locationId': 222,
                    })
                })
            }
        })

        wrapper.vm.timeDialog = true
        wrapper.vm.$store.state.data.appointment = null
        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.chooseAppointment(1684386000)

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(mockCallback.mock.calls[0][0]).toBe('API/reserveAppointment')
        expect(wrapper.vm.timeDialog).toBeTruthy()
        expect(wrapper.emitted().next).toBeDefined()
    })

    it('chooseAppointment method reserves appointment by rebooking', async () => {
        const mockCallback = jest.fn((method, parameters) => {
            if (method === 'API/reserveAppointment') {
                return new Promise((resolve, reject) => {
                    resolve({
                        'provider': 111,
                        'officeName': 'Office name',
                        'locationId': 222,
                    })
                })
            }
        })

        wrapper.vm.timeDialog = true
        wrapper.vm.$store.state.isRebooking = true
        wrapper.vm.$store.state.data.appointment = {}
        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.chooseAppointment(1684386000)

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.timeDialog).toBeTruthy()
        expect(wrapper.emitted().next).toBeDefined()
    })
})