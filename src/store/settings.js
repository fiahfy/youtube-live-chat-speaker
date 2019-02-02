export const defaults = {
  voiceURI: '',
  truncateMessageLength: '16',
  rate: '1',
  queueMessages: '5',
  quickRate: '2',
  quickQueueMessages: '3'
}

export default {
  namespaced: true,
  state: {
    ...defaults
  },
  mutations: {
    setVoiceURI(state, { voiceURI }) {
      state.voiceURI = voiceURI
    },
    setTruncateMessageLength(state, { truncateMessageLength }) {
      state.truncateMessageLength = truncateMessageLength
    },
    setRate(state, { rate }) {
      state.rate = rate
    },
    setQueueMessages(state, { queueMessages }) {
      state.queueMessages = queueMessages
    },
    setQuickRate(state, { quickRate }) {
      state.quickRate = quickRate
    },
    setQuickQueueMessages(state, { quickQueueMessages }) {
      state.quickQueueMessages = quickQueueMessages
    }
  }
}
