<template>
  <div ref="mainDiv">
    <div id="customer-name-section" :aria-label="$t('nameField') + $t('fieldLengthFifty')">
      <v-text-field v-model="customer.name" id="customer-name" :error-messages="nameErrors" @blur="$v.name.$touch()"
        @change="changed" counter="50" :maxlength="50" filled :label="$t('name')"
        :disabled="isPreselectedAppointment"
        tabindex="0"
      ></v-text-field>
    </div>

    <div id="customer-email-section" :aria-label="getEmailAriaLabel()">
      <v-text-field v-model="customer.email" id="customer-email" counter="50" :maxlength="50" filled
        :error-messages="emailErrors" @blur="$v.email.$touch()" @change="changed" required :label="$t('email')"
        :disabled="isPreselectedAppointment"
        tabindex="0"
      ></v-text-field>
    </div>

    <div id="customer-telephone-section" v-if="isTelephoneActivated" :aria-label="getTelephoneAriaLabel()">
      <v-text-field v-model="customer.telephone" id="customer-telephone" counter="20" :maxlength="20" filled
        :error-messages="telephoneErrors" @blur="$v.telephone.$touch()" @change="changed"
        :label="(isTelephoneRequired) ? $t('telephoneRequired') : $t('telephone')"
        :disabled="isPreselectedAppointment"
        tabindex="0"
      ></v-text-field>
    </div>
    <div id="customer-custom-textfield-section" v-if="isCustomTextfieldActivated" :aria-label="getCustomTextAriaLabel()">
      <v-text-field v-model="customer.customTextfield" id="customer-custom-textfield" counter="50" :maxlength="50"
        filled :error-messages="customTextfieldErrors" @blur="$v.customTextfield.$touch()" @change="changed"
        :label="(isCustomTextfieldRequired ? customTextfieldLabel + '*' : customTextfieldLabel)"
        :disabled="isPreselectedAppointment"
        tabindex="0"
      ></v-text-field>
    </div>

    <v-checkbox id="customer-data-protection" v-model="customer.dataProtection" label=""
      :error-messages="dataProtectionErrors" required @input="$v.dataProtection.$touch()"
      @blur="$v.dataProtection.$touch()" @change="changed"
      tabindex="0"
      :disabled="isPreselectedAppointment"
    >
      <template v-slot:label>
        <div v-html="$t('privacyPolicyAccepted')" @click.stop></div>
      </template>
    </v-checkbox>

    <p>Hinweis: Die mit * gekennzeichneten Eingabefelder sind Pflichtfelder.</p>

    <InfoMessage
        v-if="$store.state.error === 'tooManyAppointmentsWithSameMail'"
        :type="'warning'"
        :title="$t('tooManyAppointmentsWithSameMail')"
        :text="$t('cancelSomeAppointments')"
        :tabindex="5"
    ></InfoMessage>

    <button
      id="customer-submit-button"
      class="m-button m-button--primary m-button--animated-right button-next"
      color="white"
      tabindex="0"
      @click="saveCustomer()"
    >
      <span class="desktop">{{ $t('nextToReservation') }}</span>
      <span class="mobile">{{ $t('next') }}</span>
      <svg aria-hidden="true" class="m-button__icon">
        <use xlink:href="#icon-arrow-right"></use>
      </svg>
    </button>

  </div>
</template>

<script>
import { validationMixin } from "vuelidate";
import { required, email, maxLength } from "vuelidate/lib/validators";
import InfoMessage from './InfoMessage.vue'

export default {
  name: 'CustomerInfo',
  mixins: [validationMixin],
  components: {
    InfoMessage
  },
  validations() {
    return {
      name: {
        required,
        maxLength: maxLength(50)
      },
      email: {
        required,
        email,
        maxLength: maxLength(50)
      },
      telephone: {
        required: this.isTelephoneRequired ? required : () => true,
        maxLength: maxLength(20),
        validFormat: this.validTelephoneFormat
      },
      customTextfield: {
        required: this.isCustomTextfieldRequired ? required : () => true,
        maxLength: maxLength(50)
      },
      dataProtection: {
        required
      }
    };
  },
  data() {
    return {
      customer: {}
    };
  },
  computed: {
    name: {
      get() {
        return this.customer.name
      },
      set(newValue) {
        return this.customer.name = newValue
      }
    },
    email: {
      get() {
        return this.customer.email
      },
      set(newValue) {
        return this.customer.email = newValue
      }
    },
    telephone: {
      get() {
        return this.customer.telephone
      },
      set(newValue) {
        return this.customer.telephone = newValue
      }
    },
    customTextfield: {
      get() {
        return this.customer.customTextfield
      },
      set(newValue) {
        return this.customer.customTextfield = newValue
      }
    },
    dataProtection: {
      get() {
        return this.customer.dataProtection
      },
      set(newValue) {
        return this.customer.dataProtection = newValue
      }
    },
    isCustomTextfieldActivated() {
      return this.$store.state.data.appointment &&
        this.$store.state.data.appointment.scope &&
        this.$store.state.data.appointment.scope.customTextfieldActivated == 1;
    },
    isCustomTextfieldRequired() {
      return this.$store.state.data.appointment &&
        this.$store.state.data.appointment.scope &&
        this.$store.state.data.appointment.scope.customTextfieldRequired == 1;
    },
    customTextfieldLabel() {
      return this.$store.state.data.appointment &&
        this.$store.state.data.appointment.scope &&
        this.$store.state.data.appointment.scope.customTextfieldLabel;
    },
    isTelephoneActivated() {
      return this.$store.state.data.appointment &&
        this.$store.state.data.appointment.scope &&
        this.$store.state.data.appointment.scope.telephoneActivated == 1;
    },
    isTelephoneRequired() {
      return this.$store.state.data.appointment &&
        this.$store.state.data.appointment.scope &&
        this.$store.state.data.appointment.scope.telephoneRequired == 1;
    },
    nameErrors() {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.required && errors.push(this.$t('nameIsRequired'));
      !this.$v.name.maxLength && errors.push(this.$t('textLengthExceeded'));

      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      !this.$v.email.email && errors.push(this.$t('emailIsRequired'));
      !this.$v.email.required && errors.push(this.$t('emailIsRequired'));
      !this.$v.email.maxLength && errors.push(this.$t('textLengthExceeded'));

      return errors;
    },
    telephoneErrors() {
      const errors = [];
      if (!this.$v.telephone.$dirty) return errors;
      !this.$v.telephone.required && errors.push(this.$t('telephoneIsRequired'));
      !this.$v.telephone.maxLength && errors.push(this.$t('textLengthExceeded'));
      !this.$v.telephone.validFormat && errors.push(this.$t('mustBeValidTelephone'));
      return errors;
    },
    customTextfieldErrors() {
      const errors = [];
      if (!this.$v.customTextfield.$dirty) return errors;
      !this.$v.customTextfield.required && errors.push(this.$t('customTextfieldIsRequired'));
      !this.$v.customTextfield.maxLength && errors.push(this.$t('textLengthExceeded'));
      return errors;
    },

    dataProtectionErrors() {
      const errors = [];
      if (!this.$v.dataProtection.$dirty) return errors;
      !this.customer.dataProtection && errors.push(this.$t('acceptPrivacyPolicy'));

      return errors;
    },
    isPreselectedAppointment() {

      return this.$store.state.preselectedAppointment !== null;
    }
  },
  methods: {
    changed() {
      this.$emit('changed')
    },
    saveCustomer() {
      this.$v.$touch()

      if (this.emailErrors.length || this.nameErrors.length || this.dataProtectionErrors.length || this.telephoneErrors.length || this.customTextfieldErrors.length) {
        return
      }
      this.$store.dispatch('updateAppointmentData', {
        ...this.$store.state.data.appointment,
        ...{
          client: {
            ...this.customer,
          }
        }
      }).then(() => {
        this.$store.state.confirmedAppointment = null
        this.$store.state.error = null
          this.$emit('next')
          window.scrollTo(0, 0)
          this.$v.$reset()
        }, (error) => {
          console.error(error)
          this.$store.state.error = 'tooManyAppointmentsWithSameMail'
        })
    },
    validTelephoneFormat(value) {
      const phoneRegex = /^\+?\d+$/;
      return !value || phoneRegex.test(value);
    },
    getEmailAriaLabel() {
      const previousFieldError = this.nameErrors.length > 0 ? this.$t('nameIsRequired') : '';
      return `${previousFieldError} ${this.$t('emailField') + this.$t('fieldLengthFifty')}`;
    },
    getTelephoneAriaLabel() {
      const previousFieldError = this.emailErrors.length > 0 ? this.$t('emailIsRequired') : '';
      return `${previousFieldError} ${this.$t('telephoneField') + this.$t('fieldLengthTwenty')}`;
    },
    getCustomTextAriaLabel() {
      const previousFieldError = this.telephoneErrors.length > 0 ? this.$t('telephoneIsRequired') : '';
      return `${previousFieldError} ${this.$t('customField') + this.$t('fieldLengthFifty')}`;
    }
  },
  mounted() {
    this.customer = this.$store.state.data.customer
  }
}
</script>
<style scoped>

</style>
