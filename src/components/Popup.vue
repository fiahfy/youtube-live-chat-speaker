<template>
  <v-app>
    <v-content>
      <v-container fluid class="py-0">
        <v-layout row align-center>
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
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
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
      chrome.runtime.sendMessage({
        id: 'volumeChanged',
        data: { volume: value }
      })
    }
  },
  async created() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ id: 'popupLoaded' }, (response) => {
        this.volume = response
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

<style>
@import '~vuetify/dist/vuetify.min.css';
</style>

<style scoped>
.application {
  min-width: 256px;
}
</style>
