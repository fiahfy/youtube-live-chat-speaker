<template>
  <v-app>
    <v-content class="fill-height">
      <v-container fluid>
        <v-slider
          v-model="volume"
          min="0"
          max="1"
          step="0.1"
          hide-details
          :prepend-icon="icon"
          @click:prepend="onClickIcon"
        />
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { browser } from 'webextension-polyfill-ts'
import { Vue, Component, Watch } from 'vue-property-decorator'

@Component
export default class Popup extends Vue {
  volume = 0
  storedVolume = 0

  get icon() {
    switch (true) {
      case this.volume > 0.5:
        return 'mdi-volume-high'
      case this.volume > 0:
        return 'mdi-volume-medium'
      default:
        return 'mdi-volume-off'
    }
  }

  @Watch('volume')
  async onVolumeChanged(value: number) {
    await browser.runtime.sendMessage({
      id: 'volumeChanged',
      data: { volume: value },
    })
  }

  async created() {
    const { volume } = await browser.runtime.sendMessage({ id: 'popupLoaded' })
    this.volume = volume
  }

  onClickIcon() {
    if (this.volume) {
      this.storedVolume = this.volume
      this.volume = 0
    } else {
      this.volume = this.storedVolume
    }
  }
}
</script>

<style lang="scss">
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}
html {
  overflow-y: hidden;
}
</style>

<style lang="scss" scoped>
.v-application {
  min-width: 320px;
  .v-content ::v-deep .v-content__wrap {
    overflow-y: auto;
  }
}
</style>
