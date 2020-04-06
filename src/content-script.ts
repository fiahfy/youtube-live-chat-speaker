import { browser } from 'webextension-polyfill-ts'
import Settings, { AuthorType } from '~/models/settings'

type Queue = { message: string; timestamp: number }

let volume: number
let settings: Settings
let queues: Queue[] = []
let voice: SpeechSynthesisVoice | undefined = undefined
let ssu: SpeechSynthesisUtterance | undefined = undefined

const querySelectorAsync = (
  selector: string,
  interval = 100,
  timeout = 1000
): Promise<Element | null> => {
  return new Promise((resolve) => {
    const expireTime = Date.now() + timeout
    const timer = setInterval(() => {
      const e = document.querySelector(selector)
      if (e || Date.now() > expireTime) {
        clearInterval(timer)
        resolve(e)
      }
    }, interval)
  })
}

const getVoices = async (): Promise<SpeechSynthesisVoice[]> => {
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

  const voice = await getVoice()
  if (!voice) {
    return
  }

  ssu = new SpeechSynthesisUtterance(queue.message)
  ssu.rate =
    queues.length >= settings.quickQueueMessages
      ? settings.quickRate
      : settings.rate
  ssu.voice = voice
  ssu.volume = volume
  ssu.onend = async () => {
    ssu = undefined
    queues = queues.slice(1)
    shiftQueue()
  }
  ssu.onerror = () => {
    ssu = undefined
    queues = queues.slice(1)
    shiftQueue()
  }
  speechSynthesis.speak(ssu)
}

const isSpeakable = (element: HTMLElement) => {
  let authorType
  const tagName = element.tagName.toLowerCase()
  switch (tagName) {
    case 'yt-live-chat-paid-message-renderer':
      authorType = 'super_chat'
      break
    case 'yt-live-chat-legacy-paid-message-renderer':
      authorType = 'membership'
      break
    case 'yt-live-chat-text-message-renderer':
    default:
      authorType = element.getAttribute('author-type') || 'guest'
      break
  }
  return settings.enabledTypes.includes(authorType as AuthorType)
}

const speak = async (element: HTMLElement) => {
  if (!volume) {
    return
  }

  const tags = [
    'yt-live-chat-text-message-renderer',
    'yt-live-chat-paid-message-renderer',
    'yt-live-chat-legacy-paid-message-renderer',
  ]
  if (!tags.includes(element.tagName.toLowerCase())) {
    return
  }

  if (!isSpeakable(element)) {
    return
  }

  const messageEl =
    element.querySelector('#message') || element.querySelector('#detail-text')
  const message = messageEl?.textContent
  if (!message) {
    return
  }

  const truncated = message.substring(0, settings.truncateMessageLength)
  const queue = {
    message: truncated,
    timestamp: Date.now(),
  }
  if (queues.length >= settings.queueMessages) {
    return
  }

  queues = [...queues, queue]
  shiftQueue()
}

const observe = async () => {
  const items = await querySelectorAsync(
    '#items.yt-live-chat-item-list-renderer'
  )
  if (!items) {
    return
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const nodes = Array.from(mutation.addedNodes)
      nodes.forEach((node: Node) => {
        if (node instanceof HTMLElement) {
          speak(node)
        }
      })
    })
  })

  observer.observe(items, { childList: true })
}

browser.runtime.onMessage.addListener((message) => {
  const { id, data } = message
  switch (id) {
    case 'volumeChanged':
      volume = data.volume
      break
    case 'settingsChanged':
      settings = data.settings
      voice = undefined
      break
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  const data = await browser.runtime.sendMessage({ id: 'contentLoaded' })
  volume = data.volume
  settings = data.settings
  await observe()
})
