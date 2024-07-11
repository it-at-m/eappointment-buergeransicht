<!-- src/components/NotFound.vue -->
<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <div class="text-center">
          <h1 class="display-2 font-weight-bold mb-2">404</h1>
          <h2 class="subtitle-1 mb-4">Seite nicht gefunden</h2>
          <p>Die Seite, die Sie suchen, existiert nicht oder wurde verschoben.</p>
          <span>
            <a
              class="m-button m-button--primary m-button--animated-right button-submit"
              href="https://stadt.muenchen.de/infos/online-terminvereinbarung.html"
              tabindex="0"
            >
              <svg aria-hidden="true" class="m-button__icon">
                <use xlink:href="#icon-arrow-left"></use>
              </svg>
              <span>{{ $t('backToHome') }}</span>
            </a>
          </span>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goHome() {
      this.$store.commit('setError', null);
    }
  }
}
</script>

<style>
/* Add your styles here */
</style>
