<template>
  <div ref="mainDiv">
    <div id="customer-name-section">
      <v-text-field v-model="customer.name" id="customer-name" :error-messages="nameErrors" @blur="$v.name.$touch()"
        @change="changed" counter="50" filled :label="$t('name')" :disabled="isPreselectedAppointment"></v-text-field>
    </div>

    <div id="customer-email-section">
      <v-text-field v-model="customer.email" id="customer-email" counter="50" filled :error-messages="emailErrors"
        @blur="$v.email.$touch()" @change="changed" required :label="$t('email')"
        :disabled="isPreselectedAppointment"></v-text-field>
    </div>



    <div id="customer-telephone-section">
      <div class="telephone-wrapper">

        <v-select v-model="selectedCountryCode" :items="countryCodes" label="Country Code" :attach="attachedElement"
          :menu-props="{ offsetY: true }" class="telephone-country-code"></v-select>

        <v-text-field v-model="telephone" id="customer-telephone" counter="16" filled :error-messages="telephoneErrors"
          @blur="handleTelephoneBlur()" @input="validateTelephone()" @change="changed" :label="$t('telephone')"
          :disabled="isPreselectedAppointment" class="telephone-input">
        </v-text-field>


      </div>
    </div>
    <!-- ... remaining components ... -->



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
        { text: 'Germany (+49)', value: '+49' },
        { text: 'Austria (+43)', value: '+43' },
      ],
      selectedCountryCode: '+49',  // default to Germany
      hasTelephoneLengthExceeded: false,
      phoneNumberNotInFormat: false,
      hasTelephoneBlurred: false,
    };
  },
  watch: {
    selectedCountryCode(newCode, oldCode) {
      if (this.customer.telephone === oldCode) {
        // If the old telephone was just the old prefix, set it to the new prefix
        this.customer.telephone = newCode;
      } else if (this.customer.telephone && oldCode) {
        // Replace the old country code with the new one if present
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
        // When getting the value, strip out the country code
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
        //console.log("Set telephone: ", this.customer.telephone); // Add this line
        this.$v.telephone.$touch();

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

    // ... other computed properties ...
    telephoneErrors() {
      const errors = [];
      if (!this.$v.telephone.$dirty && !this.hasTelephoneBeenTouched) return errors; // Check for our flag here
      if (this.hasTelephoneLengthExceeded) {
        errors.push(this.$t('textLengthExceeded'));
      }
      if (this.phoneNumberNotInFormat) {
        errors.push(this.$t('phoneNumber should be in international format starting with "+" followed by country code and local number'));
      }
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
      //const fullTelephone = this.selectedCountryCode + this.customer.telephone;
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
      console.log(this.$store.state.data.appointment.telephone);
    },
    validateTelephone() {
      if (!this.hasTelephoneBlurred) return;
      // Only check the phone number format if the phone number exists and is not undefined
      if (this.customer.telephone && this.customer.telephone.trim() !== '') {
        if (this.customer.telephone.length > 19) {
          this.hasTelephoneLengthExceeded = true;
        } else {
          this.hasTelephoneLengthExceeded = false;
        }

        // Define the regex pattern
        const regexPattern = /^\+[1-9]{1}[0-9]{0,2}[1-9][0-9]{6,14}$/;


        if (!regexPattern.test(this.customer.telephone)) {
          this.phoneNumberNotInFormat = true;
        } else {
          this.phoneNumberNotInFormat = false;
        }
      } else {
        this.phoneNumberNotInFormat = false; // Reset the error if the field is empty or undefined
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
.telephone-wrapper {
  display: flex;
  align-items: center;
  /* This will ensure the items are vertically aligned in the center */
  gap: 10px;
  /* Gap between the v-select and the v-text-field */
}

.telephone-country-code {
  flex: 1;
  /* Takes up equal width as the v-text-field */
}

.telephone-input {
  flex: 1;
  /* Takes up equal width as the v-select */
}
</style>
