<template>
  <div class="m-component m-component-callout m-component-callout--fullwidth">
    <div>
      <div class="m-component__grid">
        <div class="m-component__column">
          <div :class="['m-callout', 'm-callout--' + type ]">
            <div class="m-callout__inner">
              <div class="m-callout__icon">
                <svg aria-hidden="true" class="icon">
                  <use v-if="type === 'success'" xlink:href="#icon-check"></use>
                  <use v-if="type === 'warning'" xlink:href="#icon-check"></use>
                  <use v-if="type === 'default'" xlink:href="#icon-information"></use>
                </svg>
                <span class="visually-hidden"></span>
              </div>
              <div class="m-callout__body">
                <div class="m-callout__body__inner">
                  <h2 class="m-callout__headline appointment-confirmation" :tabindex="tabindex">{{ title }}</h2>
                  <div class="m-callout__content appointment-confirmation-notice">
                    <p :tabindex="tabindex">{{ text }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoMessage',
  props: {
    type: {
      default: 'default',
      type: String
    },
    title: {
      default: '',
      type: String
    },
    text: {
      default: '',
      type: String
    },
    tabindex: {
      default: 1,
      type: Number
    }
  }
}
</script>
<style scoped>
</style>