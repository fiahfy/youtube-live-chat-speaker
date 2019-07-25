<template>
  <v-app>
    <v-content>
      <v-container fluid>
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
        <v-layout row>
          <v-flex class="pr-3">
            <v-slider
              v-model="rate"
              class=""
              label="Speaking Rate"
              min="0"
              max="2"
              step="0.1"
              hide-details
            />
          </v-flex>
          <v-flex class="rate mt-3 text-xs-right body-1" shrink>
            {{ rate }}
          </v-flex>
        </v-layout>
        <v-text-field
          v-model="queueMessages"
          :placeholder="placeholder.queueMessages"
          label="Queue Messages"
          type="number"
          min="1"
          max="100"
          suffix="messages"
        />
        <v-layout row>
          <v-flex class="pr-3">
            <v-slider
              v-model="quickRate"
              class=""
              label="Quick Speaking Rate"
              min="0"
              max="2"
              step="0.1"
              hide-details
            />
          </v-flex>
          <v-flex class="rate mt-3 text-xs-right body-1" shrink>
            {{ quickRate }}
          </v-flex>
        </v-layout>
        <v-text-field
          v-model="quickQueueMessages"
          :placeholder="placeholder.quickQueueMessages"
          label="Quick Queue Messages"
          type="number"
          min="1"
          max="100"
          suffix="messages"
        />
        <v-btn class="mt-3" color="primary" flat block @click="onResetClick">
          Reset
        </v-btn>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      placeholder: {
        truncateMessageLength: '16',
        queueMessages: '5',
        quickQueueMessages: '3'
      },
      voices: [],
      defaultVoiceURI: ''
    }
  },
  computed: {
    voiceURI: {
      get() {
        return this.$store.state.voiceURI || this.defaultVoiceURI
      },
      set(value) {
        this.$store.commit('setVoiceURI', { voiceURI: value })
      }
    },
    truncateMessageLength: {
      get() {
        return this.$store.state.truncateMessageLength
      },
      set(value) {
        this.$store.commit('setTruncateMessageLength', {
          truncateMessageLength: value
        })
      }
    },
    rate: {
      get() {
        return this.$store.state.rate
      },
      set(value) {
        this.$store.commit('setRate', { rate: value })
      }
    },
    queueMessages: {
      get() {
        return this.$store.state.queueMessages
      },
      set(value) {
        this.$store.commit('setQueueMessages', {
          queueMessages: value
        })
      }
    },
    quickRate: {
      get() {
        return this.$store.state.quickRate
      },
      set(value) {
        this.$store.commit('setQuickRate', { quickRate: value })
      }
    },
    quickQueueMessages: {
      get() {
        return this.$store.state.quickQueueMessages
      },
      set(value) {
        this.$store.commit('setQuickQueueMessages', {
          quickQueueMessages: value
        })
      }
    }
  },
  async created() {
    speechSynthesis.onvoiceschanged = () => {
      this.voices = speechSynthesis.getVoices().map((voice) => {
        if (voice.default) {
          this.defaultVoiceURI = voice.voiceURI
        }
        return {
          value: voice.voiceURI,
          text: voice.name + ' (' + voice.lang + ')'
        }
      })
    }
  },
  methods: {
    onResetClick() {
      this.resetState()
    },
    ...mapMutations(['resetState'])
  }
}
</script>

<style scoped>
.application {
  min-width: 480px;
}
.rate {
  line-height: 32px;
  width: 32px;
}
</style>
