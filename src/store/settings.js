export const defaults = {
  voiceURI: ''
}

export default {
  namespaced: true,
  state: {
    ...defaults
  },
  mutations: {
    setVoiceURI(state, { voiceURI }) {
      state.voiceURI = voiceURI
    }
  }
}
