import browser from 'webextension-polyfill'
import createStore from './store'
import iconOff from './assets/icon-off.png'
import iconDown from './assets/icon-down.png'
import iconUp from './assets/icon-up.png'
import './assets/icon.png'

let initialVolume = 0
const volumes = {}

const getSettings = async () => {
  const store = await createStore(true)
  return JSON.parse(JSON.stringify(store.state))
}

const setIcon = async (tabId) => {
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
  await browser.pageAction.setIcon({ tabId, path })
}

const initTab = async (tabId) => {
  const volume = initialVolume
  volumes[tabId] = volume

  await setIcon(tabId)
  await browser.pageAction.show(tabId)

  const settings = await getSettings()

  return { volume, settings }
}

const volumeChanged = async (tabId, volume) => {
  initialVolume = volume
  volumes[tabId] = volume

  await setIcon(tabId)

  await browser.tabs.sendMessage(tabId, {
    id: 'volumeChanged',
    data: { volume }
  })
}

const settingsChanged = async () => {
  const settings = await getSettings()
  const tabs = await browser.tabs.query({})
  for (let tab of tabs) {
    try {
      await browser.tabs.sendMessage(tab.id, {
        id: 'settingsChanged',
        data: { settings }
      })
    } catch (e) {} // eslint-disable-line no-empty
  }
}

browser.runtime.onMessage.addListener(async (message, sender) => {
  const { id, data } = message
  const { tab } = sender
  switch (id) {
    case 'contentLoaded':
      return await initTab(tab.id)
    case 'popupLoaded': {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true
      })
      for (let tab of tabs) {
        return { volume: volumes[tab.id] }
      }
      return { volume: 0 }
    }
    case 'volumeChanged': {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true
      })
      for (let tab of tabs) {
        await volumeChanged(tab.id, data.volume)
      }
      break
    }
    case 'settingsChanged':
      await settingsChanged()
      break
  }
})
