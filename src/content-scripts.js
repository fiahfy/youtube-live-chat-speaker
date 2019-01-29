import logger from './utils/logger'

const clearSec = 5
const rateUpQueueLength = 5
const truncateLength = 140
let volume = 0
let settings = {}
let voice = null
let queues = []
let ssu = null

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

const shift = async () => {
  const queue = queues.shift()
  if (!queue) {
    return
  }
  if (
    queues.length >= rateUpQueueLength &&
    Date.now() - queue.timestamp > clearSec * 1000
  ) {
    queues = queues.filter(
      (queue) => Date.now() - queue.timestamp < clearSec * 1000
    )
  }
  ssu = new SpeechSynthesisUtterance(queue.message)
  ssu.rate = queues.length >= rateUpQueueLength ? 2 : 1
  ssu.voice = await getVoice()
  ssu.volume = volume
  ssu.onend = async () => {
    ssu = null
    shift()
  }
  ssu.onerror = () => {
    ssu = null
    shift()
  }
  speechSynthesis.speak(ssu)
}

const speak = async (node) => {
  if (!volume) {
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
  const message = text.substring(0, truncateLength)
  const queue = {
    message,
    timestamp: Date.now()
  }
  queues.push(queue)
  if (!ssu) {
    shift()
  }
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  logger.log('chrome.runtime.onMessage', message, sender, sendResponse)

  const { id, data } = message
  switch (id) {
    case 'volumeChanged':
      volume = data.volume
      if (!volume) {
        queues = []
      }
      break
    case 'stateChanged':
      settings = data.state.settings
      voice = null
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
