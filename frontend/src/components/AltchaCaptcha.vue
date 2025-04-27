<template>
  <div v-if="captchaEnabled && captchaChallengeUrl && captchaVerifyUrl">
    <altcha-widget
      ref="widget"
      :challengeurl="captchaChallengeUrl"
      :verifyurl="captchaVerifyUrl"
      :strings="i18n"
      @load="onLoad"
      @statechange="handleStateChange"
      @serververification="handleServerVerification"
    />
  </div>
  <div v-else>
    <p>Das Captcha konnte nicht geladen werden.</p>
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
      i18n: JSON.stringify({
        error: "Verifizierung fehlgeschlagen. Versuche es später noch einmal.",
        expired: "Verifizierung abgelaufen. Versuche es erneut.",
        footer:
          'Geschützt durch <a href="https://altcha.org/" target="_blank" aria-label="Besuche Altcha.org">ALTCHA</a>',
        label: "Ich bin kein Bot.",
        verified: "Erfolgreich verifiziert!",
        verifying: "Überprüfe...",
        waitAlert: "Überprüfung läuft... bitte warten.",
      }),
    };
  },
  methods: {
    onLoad(ev) {
      try {
        ev.target.configure({
          strings: JSON.parse(this.i18n),
        });
      } catch (err) {
        console.error("Fehler bei configure nach load:", err);
      }
    },
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
    const widget = this.$refs.altchaWidget;
    if (widget) {
      widget.setAttribute("challengeurl", this.captchaChallengeUrl);
      widget.setAttribute("verifyurl", this.captchaVerifyUrl);
      
      widget.addEventListener("statechange", this.handleStateChange);
      widget.addEventListener("serververification", this.handleServerVerification);
      this.configureWidget();
    }
  },
  beforeDestroy() {
    const widget = this.$refs.altchaWidget;
    if (widget) {
      widget.removeEventListener("statechange", this.handleStateChange);
      widget.removeEventListener("serververification", this.handleServerVerification);
    }
  },
};
</script>
