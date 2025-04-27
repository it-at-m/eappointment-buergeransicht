<template>
  <div v-if="captchaEnabled && captchaChallengeUrl && captchaVerifyUrl">
    <altcha-widget
      ref="widget"
      :challengeurl="captchaChallengeUrl"
      :verifyurl="captchaVerifyUrl"
      :strings="stringifiedI18n"
      @statechange="handleStateChange"
      @serververification="handleServerVerification"
    />
  </div>
  <div v-else>
    <p>{{ $t('altcha.loadError') }}</p>
  </div>
</template>

<script>
import "altcha";

export default {
  name: "AltchaCaptcha",

  data() {
    const base = this.$store.state.settings.endpoints.VUE_APP_ZMS_API_BASE;
    const challenge = this.$store.state.settings.endpoints.VUE_APP_ZMS_API_CAPTCHA_CHALLENGE_ENDPOINT;
    const verify = this.$store.state.settings.endpoints.VUE_APP_ZMS_API_CAPTCHA_VERIFY_ENDPOINT;

    return {
      captchaEnabled: true,
      captchaChallengeUrl: base + challenge,
      captchaVerifyUrl: base + verify,
    };
  },

  computed: {
    i18nObj() {
      return {
        error: this.$t('altcha.error'),
        expired: this.$t('altcha.expired'),
        footer: this.$t('altcha.footer'),
        label: this.$t('altcha.label'),
        verified: this.$t('altcha.verified'),
        verifying: this.$t('altcha.verifying'),
        waitAlert: this.$t('altcha.waitAlert'),
      };
    },
    stringifiedI18n() {
      return JSON.stringify(this.i18nObj);
    },
  },

  methods: {
    handleStateChange(ev) {
      if (ev.detail && ev.detail.state) {
        this.$emit("validationResult", ev.detail.state === "verified");
      }
    },
    handleServerVerification(ev) {
      if (ev.detail && ev.detail.token) {
        this.$emit("tokenChanged", ev.detail.token);
      }
    },
  },

  mounted() {
    const widget = this.$refs.widget;
    if (!widget) return;

    widget.setAttribute("challengeurl", this.captchaChallengeUrl);
    widget.setAttribute("verifyurl", this.captchaVerifyUrl);
    widget.setAttribute("strings", this.stringifiedI18n);

    widget.addEventListener("statechange",this.handleStateChange);
    widget.addEventListener("serververification", this.handleServerVerification);
  },

  beforeUnmount() {
    const widget = this.$refs.widget;
    if (!widget) return;
    widget.removeEventListener("statechange", this.handleStateChange);
    widget.removeEventListener("serververification", this.handleServerVerification);
  },
};
</script>
