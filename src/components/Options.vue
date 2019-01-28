<template>
  <v-app>
    <v-content>
      <v-container fluid>
        <v-select v-model="voiceURI" :items="voices" label="Voice" />
        <v-btn class="mt-3" color="primary" flat block @click="reset">
          Reset
        </v-btn>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
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
    close() {
      window.close()
    },
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
</style>
