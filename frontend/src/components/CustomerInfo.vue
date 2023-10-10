<template>
  <div ref="mainDiv">
    <p><b>Hinweis: Die mit * gekennzeichneten Eingabefelder sind Pflichtfelder.</b></p>
    <div id="customer-name-section">
      <v-text-field v-model="customer.name" id="customer-name" :error-messages="nameErrors" @blur="$v.name.$touch()"
        @change="changed" counter="50" filled :label="$t('name')" :disabled="isPreselectedAppointment"></v-text-field>
    </div>

    <div id="customer-email-section">
      <v-text-field v-model="customer.email" id="customer-email" counter="50" filled :error-messages="emailErrors"
        @blur="$v.email.$touch()" @change="changed" required :label="$t('email')"
        :disabled="isPreselectedAppointment"></v-text-field>
    </div>

    <div id="customer-telephone-section" v-if="isTelephoneActivated">
        <v-row no-gutters>
          <v-col cols="12" sm="4" md="3" lg="2" xl="1" class="pr-2 mb-0">
            <v-select 
              v-model="selectedCountryCode"
              id="country-code"
              :items="countryCodes"
              :label="(isTelephoneRequired) ? $t('countryCodeRequired') : $t('countryCode')"
              :attach="attachedElement"
              :menu-props="{ offsetY: true, bottom: true, nudgeBottom: 300 }">
            </v-select>
          </v-col>
          <v-col cols="12" sm="8" md="9"  lg="10" xl="11">
            <v-text-field 
              v-model="telephone" 
              id="customer-telephone" 
              counter="16" 
              filled 
              :error-messages="telephoneErrors"
              @blur="handleTelephoneBlur()" 
              @input="validateTelephone()" 
              @change="changed"
              :label="(isTelephoneRequired) ? $t('telephoneRequired') : $t('telephone')"
              :disabled="isPreselectedAppointment">
            </v-text-field>
          </v-col>
        </v-row>
      </div>

    <v-checkbox id="customer-data-protection" v-model="customer.dataProtection" label=""
      :error-messages="dataProtectionErrors" required @input="$v.dataProtection.$touch()"
      @blur="$v.dataProtection.$touch()" @change="changed">
      <template v-slot:label>
        <div v-html="$t('privacyPolicyAccepted')" @click.stop></div>
      </template>
    </v-checkbox>

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
  validations: {
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
      maxLength: maxLength(19)
    },
    dataProtection: {
      required
    }
  },
  data() {
    return {
      attachedElement: null,
      customer: {},
      countryCodes: [
        { text: 'DE (+49)', value: '+49' },
        { text: 'AT (+43)', value: '+43' },
      ],
      selectedCountryCode: '+49',
      hasTelephoneLengthExceeded: false,
      phoneNumberNotInFormat: false,
      hasTelephoneBlurred: false,
      isTelephoneEmpty: false,
    };
  },
  watch: {
    selectedCountryCode(newCode, oldCode) {
      if (this.customer.telephone === oldCode) {
        this.customer.telephone = newCode;
      } else if (this.customer.telephone && oldCode) {
        this.customer.telephone = this.customer.telephone.replace(oldCode, newCode);
      }
    },
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
        return this.customer.telephone ? this.customer.telephone.replace(this.selectedCountryCode, '') : '';
      },
      set(newValue) {
        if (newValue === '') {
          this.customer.telephone = '';
        } else if (newValue === this.selectedCountryCode) {
          this.customer.telephone = this.selectedCountryCode;
        } else {
          this.customer.telephone = this.selectedCountryCode + newValue;
        }
        this.$v.telephone.$touch();
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
      if (!this.$v.telephone.$dirty && !this.hasTelephoneBeenTouched) return errors;
      if (this.hasTelephoneLengthExceeded) {
        errors.push(this.$t('textLengthExceeded'));
      }
      if (this.phoneNumberNotInFormat) {
        errors.push(this.$t('telephoneIsRequired'));
      }
      this.isTelephoneEmpty && errors.push(this.$t('telephoneIsRequired'));

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
    handleTelephoneBlur() {
      this.hasTelephoneBlurred = true;
      this.validateTelephone();
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
    validateTelephone() {
      if (!this.hasTelephoneBlurred) return;
      this.isTelephoneEmpty = false;

      if (this.customer.telephone && this.customer.telephone.trim() !== '') {
        if (this.customer.telephone.length > 19) {
          this.hasTelephoneLengthExceeded = true;
        } else {
          this.hasTelephoneLengthExceeded = false;
        }

        const regexPattern = /^\+[1-9]{1}[0-9]{0,2}[1-9][0-9]{6,14}$/;
        this.phoneNumberNotInFormat = !regexPattern.test(this.customer.telephone);

      } else {
        this.phoneNumberNotInFormat = false;

        if (this.isTelephoneRequired) {
          this.isTelephoneEmpty = true;
        }
      }

      this.$v.telephone.$touch();
    }

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
