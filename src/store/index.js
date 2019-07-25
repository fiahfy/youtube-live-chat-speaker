import browser from 'webextension-polyfill'
import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex)

const vuexPersist = new VuexPersistence({
  storage: browser.storage.local,
  asyncStorage: true,
  restoreState: async (key, storage) => {
    const result = await storage.get(key)
    const json = result[key]

    let state = {}
    try {
      state = JSON.parse(json)
    } catch (e) {} // eslint-disable-line no-empty

    return {
      ...state,
      __storageReady: true
    }
  },
  saveState: async (key, state, storage) => {
    const json = JSON.stringify(state)
    await storage.set({ [key]: json })
  }
})

const initialState = {
  voiceURI: '',
  truncateMessageLength: '16',
  rate: '1',
  queueMessages: '5',
  quickRate: '2',
  quickQueueMessages: '3'
}

const config = {
  state: {
    ...initialState
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
    },
    resetState(state) {
      for (let [k, v] of Object.entries(initialState)) {
        state[k] = v
      }
    }
  },
  plugins: [
    vuexPersist.plugin,
    (store) => {
      store.subscribe(() => {
        browser.runtime.sendMessage({ id: 'settingsChanged' })
      })
    }
  ]
}

export default function createStore(waitStorageReady = false) {
  return new Promise((resolve) => {
    const store = new Vuex.Store(config)
    if (!waitStorageReady) {
      resolve(store)
      return
    }
    // wait for async storage restore
    // @see https://github.com/championswimmer/vuex-persist/issues/15
    const timeout = Date.now() + 1000
    const timer = setInterval(() => {
      if (store.state.__storageReady || Date.now() > timeout) {
        clearInterval(timer)
        resolve(store)
      }
    }, 100)
  })
}
