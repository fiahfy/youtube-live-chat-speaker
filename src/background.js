import { defaults } from './store/settings'
import logger from './utils/logger'
import storage from './utils/storage'
import iconOff from './assets/icon-off48.png'
import iconDown from './assets/icon-down48.png'
import iconUp from './assets/icon-up48.png'
import './assets/icon16.png'
import './assets/icon48.png'
import './assets/icon128.png'

let initialVolume = 0
const volumes = {}

const setIcon = (tabId) => {
  const volume = volumes[tabId] || 0
  let path = iconOff
  switch (true) {
    case volume > 0.5:
      path = iconUp
      break
    case volume > 0:
      path = iconDown
      break
  }
  chrome.pageAction.setIcon({ tabId, path })
}

const contentLoaded = async (tabId) => {
  const volume = initialVolume
  volumes[tabId] = volume

  setIcon(tabId)
  chrome.pageAction.show(tabId)
  chrome.tabs.sendMessage(tabId, {
    id: 'volumeChanged',
    data: { volume }
  })

  const state = await storage.get()
  chrome.tabs.sendMessage(tabId, {
    id: 'stateChanged',
    data: { state }
  })
}

const volumeChanged = (tabId, volume) => {
  initialVolume = volume
  volumes[tabId] = volume

  setIcon(tabId)
  chrome.tabs.sendMessage(tabId, {
    id: 'volumeChanged',
    data: { volume }
  })
}

const stateChanged = async () => {
  const state = await storage.get()
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {
        id: 'stateChanged',
        data: { state }
      })
    })
  })
}

chrome.runtime.onInstalled.addListener(async (details) => {
  logger.log('chrome.runtime.onInstalled', details)

  const state = await storage.get()
  const newState = {
    settings: defaults,
    ...state
  }
  await storage.set(newState)
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  logger.log('chrome.runtime.onMessage', message, sender, sendResponse)

  const { id, data } = message
  const { tab } = sender
  switch (id) {
    case 'contentLoaded':
      contentLoaded(tab.id)
      break
    case 'popupLoaded':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0]
        sendResponse(volumes[tab.id])
      })
      return true
    case 'volumeChanged':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0]
        volumeChanged(tab.id, data.volume)
      })
      break
    case 'stateChanged':
      stateChanged()
      break
  }
})

logger.log('background script loaded')
