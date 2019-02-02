import logger from './utils/logger'

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

const shiftQueue = async () => {
  if (ssu) {
    return
  }
  const queue = queues[0]
  if (!queue) {
    return
  }
  ssu = new SpeechSynthesisUtterance(queue.message)
  ssu.rate =
    queues.length >= settings.quickQueueMessages
      ? settings.quickRate
      : settings.rate
  ssu.voice = await getVoice()
  ssu.volume = volume
  ssu.onend = async () => {
    ssu = null
    queues.shift()
    shiftQueue()
  }
  ssu.onerror = () => {
    ssu = null
    queues.shift()
    shiftQueue()
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
  const message = text.substring(0, settings.truncateMessageLength)
  const queue = {
    message,
    timestamp: Date.now()
  }
  if (queues.length >= settings.queueMessages) {
    return
  }
  queues.push(queue)
  shiftQueue()
}

const observeChat = () => {
  const items = document.querySelector('#items.yt-live-chat-item-list-renderer')
  if (!items) {
    return
  }
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const nodes = Array.from(mutation.addedNodes)
      nodes.forEach((node) => {
        speak(node)
      })
    })
  })
  observer.observe(items, { childList: true })
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  logger.log('chrome.runtime.onMessage', message, sender, sendResponse)

  const { id, data } = message
  switch (id) {
    case 'volumeChanged':
      volume = data.volume
      break
    case 'stateChanged':
      settings = data.state.settings
      voice = null
      break
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  chrome.runtime.sendMessage({ id: 'contentLoaded' })

  observeChat()
})

logger.log('content script loaded')
