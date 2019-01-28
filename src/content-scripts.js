import logger from './utils/logger'

const clearSec = 5
const rateUpQueueLength = 5
const truncateLength = 140
let volume = 0
let settings = {}
let voice = null
let rateUp = false
let queues = []

const getVoices = async () => {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices()
    if (voices) {
      resolve(voices)
      return
    }
    speechSynthesis.onvoiceschanged = () => {
      const voices = speechSynthesis.getVoices()
      return resolve(voices)
    }
  })
}

const getVoice = async () => {
  if (voice) {
    return voice
  }
  const voices = await getVoices()
  voice = voices.find((voice) => settings.voiceURI === voice.voiceURI)
  if (voice) {
    return voice
  }
  voice = voices.find((voice) => voice.default)
  return voice
}

const speak = async (node) => {
  if (!volume || document.hidden) {
    return
  }
  const tags = [
    'yt-live-chat-text-message-renderer'
    // 'yt-live-chat-paid-message-renderer'
  ]
  if (!tags.includes(node.tagName.toLowerCase())) {
    return
  }
  const text = node.querySelector('#message').textContent
  if (!text) {
    return
  }
  const truncated = text.substring(0, truncateLength)
  const ssu = new SpeechSynthesisUtterance(truncated)
  ssu.rate = queues.length >= rateUpQueueLength || rateUp ? 2 : 1
  ssu.voice = await getVoice()
  ssu.volume = volume
  ssu.onend = () => {
    if (!queues.length) {
      return
    }
    const queue = queues.shift()
    if (!queues.length) {
      rateUp = false
      return
    }
    if (Date.now() - queue.timestamp > clearSec * 1000) {
      rateUp = true
      queues = []
      window.speechSynthesis.cancel()
    }
  }
  queues.push({
    timestamp: Date.now(),
    utterance: ssu
  })
  window.speechSynthesis.speak(ssu)
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  logger.log('chrome.runtime.onMessage', message, sender, sendResponse)

  const { id, data } = message
  switch (id) {
    case 'volumeChanged':
      rateUp = false
      volume = data.volume
      queues = []
      window.speechSynthesis.cancel()
      break
    case 'stateChanged':
      settings = data.state.settings
      voice = null
      queues = []
      window.speechSynthesis.cancel()
      break
  }
})

logger.log('content script loaded')

document.addEventListener('DOMContentLoaded', async () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const nodes = Array.from(mutation.addedNodes)
      nodes.forEach((node) => {
        speak(node)
      })
    })
  })
  const items = document.querySelector('#items.yt-live-chat-item-list-renderer')
  observer.observe(items, { childList: true })

  chrome.runtime.sendMessage({ id: 'contentLoaded' })
})
