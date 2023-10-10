<template>
  <div ref="mainDiv">
    <div id="customer-name-section">
      <v-text-field v-model="customer.name" id="customer-name" :error-messages="nameErrors" @blur="$v.name.$touch()"
        @change="changed" counter="50" :maxlength="50" filled :label="$t('name')" :disabled="isPreselectedAppointment"></v-text-field>
    </div>

    <div id="customer-email-section">
      <v-text-field v-model="customer.email" id="customer-email" counter="50" :maxlength="50" filled :error-messages="emailErrors"
        @blur="$v.email.$touch()" @change="changed" required :label="$t('email')"
        :disabled="isPreselectedAppointment"></v-text-field>
    </div>

    <div id="customer-telephone-section" v-if="isTelephoneActivated">
      <v-text-field v-model="customer.telephone" id="customer-telephone" counter="20" :maxlength="20"  filled :error-messages="telephoneErrors"
        @blur="$v.telephone.$touch()" @change="changed" required :label="(isTelephoneRequired) ? $t('telephoneRequired') : $t('telephone')"
        :disabled="isPreselectedAppointment"></v-text-field>
    </div>

    <v-checkbox id="customer-data-protection" v-model="customer.dataProtection" label=""
      :error-messages="dataProtectionErrors" required @input="$v.dataProtection.$touch()"
      @blur="$v.dataProtection.$touch()" @change="changed">
      <template v-slot:label>
        <div v-html="$t('privacyPolicyAccepted')" @click.stop></div>
      </template>
    </v-checkbox>

    <p>Hinweis: Die mit * gekennzeichneten Eingabefelder sind Pflichtfelder.</p>

    <v-btn id="customer-submit-button" class="button-next" elevation="2" depressed color="primary"
      @click="saveCustomer()">
      <span class="desktop">{{ $t('nextToReservation') }}</span>
      <span class="mobile">{{ $t('finishReservation') }}</span>
    </v-btn>
  </div>
</template>

<script>
import { validationMixin } from "vuelidate";
import { required, email, maxLength } from "vuelidate/lib/validators";

export default {
  name: 'CustomerInfo',
  mixins: [validationMixin],
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
      dataProtection: {
        required
      }
    };
  },
  data() {
    return {
      attachedElement: null,
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
    isTelephoneActivated() {
      return this.$store.state.data.appointment.scope.telephoneActivated == 1;
    },
    isTelephoneRequired() {
      return this.$store.state.data.appointment.scope.telephoneRequired == 1;
    },
    dataProtection: {
      get() {
        return this.customer.dataProtection
      },
      set(newValue) {
        return this.customer.dataProtection = newValue
      }
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

      if (this.emailErrors.length || this.nameErrors.length || this.dataProtectionErrors.length || this.telephoneErrors.length) {
        return
      }
      this.$store.dispatch('updateAppointmentData', {
        ...this.$store.state.data.appointment,
        ...{
          client: {
            ...this.customer,
          }
        }
      });

      this.$emit('next')
      window.scrollTo(0, 0)
      this.$v.$reset()
    },
    validTelephoneFormat(value) {
      // The regex ensures the string starts with an optional + followed by digits only
      const phoneRegex = /^\+?\d+$/;
      return phoneRegex.test(value);
    },

  },
  mounted() {
    this.attachedElement = this.$refs.mainDiv.shadowRoot || this.$refs.mainDiv;
    this.prevCountryCode = this.selectedCountryCode;
    this.customer = this.$store.state.data.customer;
  }
}
</script>
<style scoped>
</style>
