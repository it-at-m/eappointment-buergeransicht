import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
import CustomerInfo from './../../src/components/CustomerInfo.vue'
import Vuetify from 'vuetify'
import VueI18n from 'vue-i18n'
import translations from './../../src/translations'
import store from './../../src/store'
import Vue from 'vue'

Vue.use(VueI18n)
Vue.use(Vuetify)
Vue.use(Vuex)

const i18n = new VueI18n({
    locale: store.state.locale,
    messages: translations,
})

store.dispatch = jest.fn()

const wrapper = mount(CustomerInfo, {
    Vue,
    store,
    i18n,
    vuetify: new Vuetify({
        icons: {
            iconfont: 'mdiSvg'
        }
    }),
    propsData: {
        telephoneRequired: false,
        telephoneActivated: false,
        customTextfieldRequired: false,
        customTextfieldActivated: false,
        customTextfield2Required: false,
        customTextfield2Activated: false
    }
})

describe('Customer info', () => {
    const nameInput = wrapper.find('#customer-name')
    const emailInput = wrapper.find('#customer-email')
    const telephoneInput = wrapper.find('#customer-telephone')
    const customTextfieldInput = wrapper.find('#customer-custom-textfield')
    const customTextfield2Input = wrapper.find('#customer-custom-textfield2')
    const dataProtectionCheckbox = wrapper.find('#customer-data-protection')
    const submitButton = wrapper.find('#customer-submit-button') 


    it('Component is shown', () => {
        expect(wrapper.exists()).toBe(true)
    })

    it('customer data not saved because of privacy policy not accepted', async () => {
        store.state.data.appointment = {}

        nameInput.setValue('Max')
        emailInput.setValue('max@test.de')

        submitButton.trigger('click')
        await wrapper.vm.$nextTick()

        expect(store.state.data.appointment.client).toBeUndefined()
    })

    it('customer data not saved because of too big name', async () => {
        store.state.data.appointment = {}

        nameInput.setValue('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.')
        emailInput.setValue('max@test.de')

        submitButton.trigger('click')
        await wrapper.vm.$nextTick()

        expect(store.state.data.appointment.client).toBeUndefined()
    })

    it('customer data not saved because wrong mail format', async () => {
        store.state.data.appointment = {}
        const dispatch = jest.fn()
        store.dispatch = dispatch

        nameInput.setValue('Max')
        emailInput.setValue('max@test')

        submitButton.trigger('click')
        await wrapper.vm.$nextTick()
        const emailErrorMessage = wrapper.find('#customer-email-section .v-messages__message')

        expect(wrapper.emitted().next).toBeUndefined()
        expect(emailErrorMessage.text()).toBe('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
        expect(store.state.data.appointment.client).toBeUndefined()
        expect(dispatch).toHaveBeenCalledTimes(0)
    })

    it('customer data is saved', async () => {
        const mockCallback = jest.fn((method, parameters) => {
            if (method === 'updateAppointmentData') {
                return new Promise((resolve, reject) => {
                    resolve({
                        'success': true
                    })
                })
            }
        })

        store.dispatch = mockCallback

        store.state.data.appointment = {}

        nameInput.setValue('Max')
        emailInput.setValue('max@test.de')
        wrapper.vm.customer.dataProtection = true
        dataProtectionCheckbox.setChecked()

        submitButton.trigger('click')
        await wrapper.vm.$nextTick()

        console.log(store.state.data.appointment);

        expect(mockCallback).toHaveBeenCalledTimes(1)
    })
})