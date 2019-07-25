<template>
  <v-app>
    <v-content>
      <v-container fluid>
        <v-slider
          v-model="volume"
          class="mt-0"
          min="0"
          max="1"
          step="0.1"
          hide-details
          :prepend-icon="icon"
          @click:prepend="onIconClick"
        />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import browser from 'webextension-polyfill'

export default {
  data() {
    return {
      volume: 0
    }
  },
  computed: {
    icon() {
      switch (true) {
        case this.volume > 0.5:
          return 'volume_up'
        case this.volume > 0:
          return 'volume_down'
        default:
          return 'volume_off'
      }
    }
  },
  watch: {
    volume(value) {
      browser.runtime.sendMessage({
        id: 'volumeChanged',
        data: { volume: value }
      })
    }
  },
  async created() {
    return new Promise((resolve) => {
      browser.runtime.sendMessage({ id: 'popupLoaded' }).then((data) => {
        this.volume = data.volume
        resolve()
      })
    })
  },
  methods: {
    onIconClick() {
      this.volume = 0
    }
  }
}
</script>

<style scoped>
.v-application {
  min-width: 256px;
}
</style>
