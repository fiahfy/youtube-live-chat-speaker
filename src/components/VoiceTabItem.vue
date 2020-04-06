<template>
  <v-card class="pa-5" flat>
    <v-select v-model="voiceURI" :items="voices" label="Voice" />
    <v-text-field
      v-model="truncateMessageLength"
      :placeholder="placeholder.truncateMessageLength"
      label="Truncate Message Length"
      type="number"
      min="1"
      max="140"
      suffix="characters"
    />
    <div class="d-flex">
      <v-slider
        v-model="rate"
        class="mr-3"
        label="Speaking Rate"
        min="0"
        max="2"
        step="0.1"
        hide-details
      />
      <div class="text-right body-1 align-self-center">
        {{ formatNumber(rate) }}
      </div>
    </div>
    <v-text-field
      v-model="queueMessages"
      :placeholder="placeholder.queueMessages"
      label="Queue Messages"
      type="number"
      min="1"
      max="100"
      suffix="messages"
    />
    <div class="d-flex">
      <v-slider
        v-model="quickRate"
        class="mr-3"
        label="Quick Speaking Rate"
        min="0"
        max="2"
        step="0.1"
        hide-details
      />
      <div class="text-right body-1 align-self-center">
        {{ formatNumber(quickRate) }}
      </div>
    </div>
    <v-text-field
      v-model="quickQueueMessages"
      :placeholder="placeholder.quickQueueMessages"
      label="Quick Queue Messages"
      type="number"
      min="1"
      max="100"
      suffix="messages"
    />
    <v-btn class="mt-3" depressed block @click="onClickReset">
      Reset Settings to Default
    </v-btn>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { settingsStore } from '~/store'

@Component
export default class VoiceTabItem extends Vue {
  placeholder = {
    truncateMessageLength: '16',
    queueMessages: '5',
    quickQueueMessages: '3',
  }
  voices: { value: string; text: string }[] = []
  defaultVoiceURI = ''

  get voiceURI() {
    return settingsStore.voiceURI || this.defaultVoiceURI
  }
  set voiceURI(value) {
    settingsStore.setVoiceURI({ voiceURI: value })
  }
  get truncateMessageLength() {
    return settingsStore.truncateMessageLength
  }
  set truncateMessageLength(value) {
    settingsStore.setTruncateMessageLength({
      truncateMessageLength: value,
    })
  }
  get rate() {
    return settingsStore.rate
  }
  set rate(value) {
    settingsStore.setRate({ rate: value })
  }
  get queueMessages() {
    return settingsStore.queueMessages
  }
  set queueMessages(value) {
    settingsStore.setQueueMessages({
      queueMessages: value,
    })
  }
  get quickRate() {
    return settingsStore.quickRate
  }
  set quickRate(value) {
    settingsStore.setQuickRate({ quickRate: value })
  }
  get quickQueueMessages() {
    return settingsStore.quickQueueMessages
  }
  set quickQueueMessages(value) {
    settingsStore.setQuickQueueMessages({
      quickQueueMessages: value,
    })
  }

  async created() {
    speechSynthesis.onvoiceschanged = () => {
      this.voices = speechSynthesis.getVoices().map((voice) => {
        if (voice.default) {
          this.defaultVoiceURI = voice.voiceURI
        }
        return {
          value: voice.voiceURI,
          text: voice.name + ' (' + voice.lang + ')',
        }
      })
    }
  }

  onClickReset() {
    settingsStore.resetVoice()
  }
  formatNumber(value: number) {
    return value.toFixed(1)
  }
}
</script>
