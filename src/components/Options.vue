<template>
  <v-app>
    <v-content>
      <v-container fluid>
        <v-select v-model="voiceURI" :items="voices" label="Voice" />
        <v-text-field
          v-model="truncateMessageLength"
          :placeholder="defaults.truncateMessageLength"
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
          :placeholder="defaults.queueMessages"
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
          :placeholder="defaults.quickQueueMessages"
          label="Quick Queue Messages"
          type="number"
          min="1"
          max="100"
          suffix="messages"
        />
        <v-btn class="mt-3" color="primary" flat block @click="reset">
          Reset
        </v-btn>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'
import { defaults } from '~/store/settings'

export default {
  data() {
    return {
      defaults,
      voices: [],
      defaultVoiceURI: ''
    }
  },
  computed: {
    voiceURI: {
      get() {
        return this.$store.state.settings.voiceURI || this.defaultVoiceURI
      },
      set(value) {
        this.$store.commit('settings/setVoiceURI', { voiceURI: value })
      }
    },
    truncateMessageLength: {
      get() {
        return this.$store.state.settings.truncateMessageLength
      },
      set(value) {
        this.$store.commit('settings/setTruncateMessageLength', {
          truncateMessageLength: value
        })
      }
    },
    rate: {
      get() {
        return this.$store.state.settings.rate
      },
      set(value) {
        this.$store.commit('settings/setRate', { rate: value })
      }
    },
    queueMessages: {
      get() {
        return this.$store.state.settings.queueMessages
      },
      set(value) {
        this.$store.commit('settings/setQueueMessages', {
          queueMessages: value
        })
      }
    },
    quickRate: {
      get() {
        return this.$store.state.settings.quickRate
      },
      set(value) {
        this.$store.commit('settings/setQuickRate', { quickRate: value })
      }
    },
    quickQueueMessages: {
      get() {
        return this.$store.state.settings.quickQueueMessages
      },
      set(value) {
        this.$store.commit('settings/setQuickQueueMessages', {
          quickQueueMessages: value
        })
      }
    }
  },
  async created() {
    await this.$store.dispatch('initialize')
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
    ...mapActions({
      reset: 'reset'
    })
  }
}
</script>

<style>
@import '~vuetify/dist/vuetify.min.css';
</style>

<style scoped>
.application {
  min-width: 480px;
}
.rate {
  line-height: 32px;
  width: 32px;
}
</style>
