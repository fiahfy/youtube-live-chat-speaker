import logger from './utils/logger'

const delaySec = 5
let volume
let timestamps = []

const speak = (node) => {
  if (!volume || document.hidden) {
    return
  }
  const tags = [
    'yt-live-chat-text-message-renderer',
    // 'yt-live-chat-paid-message-renderer'
  ]
  if (!tags.includes(node.tagName.toLowerCase())) {
    return
  }
  const text = node.querySelector('#message').textContent
  const ssu = new SpeechSynthesisUtterance(text)
  ssu.rate = timestamps.length ? 2 : 1
  ssu.volume = volume
  ssu.onstart = () => {
    console.log(timestamps[0])
  }
  ssu.onend = () => {
    const timestamp = timestamps.shift()
    console.log(timestamp, Date.now() - timestamp)
    if (Date.now() - timestamp > delaySec * 1000) {
      console.log('reset')
      timestamps = []
      window.speechSynthesis.cancel()
    }
  }
  ssu.onerror = (e) => {
    console.log(e)
  }
  timestamps.push(Date.now())
  window.speechSynthesis.speak(ssu)
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  logger.log('chrome.runtime.onMessage', message, sender, sendResponse)

  const { id, data } = message
  switch (id) {
    case 'volumeChanged':
      volume = data.volume
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
