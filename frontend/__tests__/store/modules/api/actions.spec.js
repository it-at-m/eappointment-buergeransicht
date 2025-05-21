import actions from './../../../../src/store/modules/api/actions'
import store from './../../../../src/store/index'
import { enableFetchMocks } from 'jest-fetch-mock'
import moment from "moment"
enableFetchMocks()
Date.now = jest.fn().mockReturnValue(new Date('2020-05-13T12:33:37.000Z'))

store.rootState = {
    settings: {
        endpoints: {
            'VUE_APP_ZMS_API_BASE': 'http://localhost:8082',
            'VUE_APP_ZMS_API_PROVIDERS_AND_SERVICES_ENDPOINT': '/api/backend/offices-and-services/',
            'VUE_APP_ZMS_API_CALENDAR_ENDPOINT': '/api/backend/available-days/',
            'VUE_APP_ZMS_API_AVAILABLE_TIME_SLOTS_ENDPOINT': '/api/backend/available-appointments/',
            'VUE_APP_ZMS_API_RESERVE_APPOINTMENT_ENDPOINT': '/api/backend/reserve-appointment/',
            'VUE_APP_ZMS_API_APPOINTMENT_ENDPOINT': '/api/backend/appointment/',
            'VUE_APP_ZMS_API_UPDATE_APPOINTMENT_ENDPOINT': '/api/backend/update-appointment/',
            'VUE_APP_ZMS_API_CONFIRM_RESERVATION_ENDPOINT': '/api/backend/confirm-appointment/',
            'VUE_APP_ZMS_API_CANCEL_APPOINTMENT_ENDPOINT': '/api/backend/cancel-appointment/',
            'VUE_APP_ZMS_API_PRECONFIRM_RESERVATION_ENDPOINT': '/api/backend/preconfirm-appointment/',
            'VUE_APP_ZMS_API_CAPTCHA_DETAILS_ENDPOINT': '/api/backend/captcha-details/'
        }
    }
}

describe('API actions', () => {
    beforeEach(() => {
        fetch.resetMocks()
        fetch.mockResponse(JSON.stringify({ok: 'ok'}))
    })

    it('confirmReservation calls API to confirm reservation', async () => {
        const res = await actions.confirmReservation(store, {processId: 'aaa', authKey: 'bbb'})
        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toBe('http://localhost:8082/api/backend/confirm-appointment/')
        expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({
            processId: 'aaa',
            authKey: 'bbb'
        }))
    })

    it('preconfirmReservation calls API to pre-confirm reservation', async () => {
        const res = await actions.preconfirmReservation(store, {processId: 'aaa', authKey: 'bbb'})
        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toBe('http://localhost:8082/api/backend/preconfirm-appointment/')
        expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({
            processId: 'aaa',
            authKey: 'bbb'
        }))
    })

    it('cancelAppointment calls API to cancel reservation', async () => {
        const res = await actions.cancelAppointment(store, {processId: 'aaa', authKey: 'bbb'})
        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toBe('http://localhost:8082/api/backend/cancel-appointment/')
        expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({
            processId: 'aaa',
            authKey: 'bbb'
        }))
    })

    it('fetchAvailableDays calls API to fetch available days', async () => {
        const res = await actions.fetchAvailableDays(store, {
            provider: {
                id: 111,
                name: 'Provider name'
            },
            serviceIds: [111, 222],
            serviceCounts: [1, 2]
        })

        expect(fetch.mock.calls.length).toEqual(1);
        //expect(fetch.mock.calls[0][0]).toBe('http://localhost:8082/api/backend/available-days/?startDate=2020-5-13&endDate=2020-11-13&officeId=111&serviceId=111%2C222&serviceCount=1%2C2')
    })

    it('fetchServicesAndProviders calls API to fetch services and providers', async () => {
        const res = await actions.fetchServicesAndProviders(store)

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toBe('http://localhost:8082/api/backend/offices-and-services/')
    })

    it('fetchAppointment calls API to fetch appointment', async () => {
        const res = await actions.fetchAppointment(store, {processId: 'aaa', authKey: 'bbb', scope: 'ccc'})

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toBe('http://localhost:8082/api/backend/appointment/?processId=aaa&authKey=bbb&scope=ccc')
    })

    it('fetchAvailableTimeSlots calls API to fetch available time slots', async () => {
        const res = await actions.fetchAvailableTimeSlots(store, {
            date: '2023-03-01',
            provider: {
                id: 111,
                name: 'Provider name'
            },
            serviceIds: [222, 333],
            serviceCounts: [2,3]
        })

        expect(fetch.mock.calls.length).toEqual(1);
        //expect(fetch.mock.calls[0][0]).toBe('http://localhost:8082/api/backend/available-appointments/?date=2023-3-1&officeId=111&serviceId=222%2C333&serviceCount=2%2C3')
    })

    it('updateAppointmentData calls API to update appointment data', async () => {
        const res = await actions.updateAppointmentData(store, {
            processId: 'aaa',
            authKey: 'bbb',
            familyName: 'Musterman',
            email: 'test@gmail.com',
            telephone: '',
            customTextfield: '',
            customTextfield2: ''
        })

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toBe('http://localhost:8082/api/backend/update-appointment/')
        expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({
            "processId": 'aaa',
            "authKey": 'bbb',
            "familyName": 'Musterman',
            "email": 'test@gmail.com',
            "telephone": '',
            "customTextfield": '',
            "customTextfield2": ''
        }))
    })

    it('reserveAppointment calls API to reserve appointment', async () => {
        const res = await actions.reserveAppointment(store, {
            timeSlot: moment(),
            serviceCounts: [2],
            providerId: 111,
            serviceIds: [222]
        })

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toBe('http://localhost:8082/api/backend/reserve-appointment/')
        expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({
            "timestamp": 1589373217,
            "serviceCount": [2],
            "officeId": 111,
            "serviceId": [222]
        }))
    })
})