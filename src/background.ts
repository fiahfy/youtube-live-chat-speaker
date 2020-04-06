import { browser } from 'webextension-polyfill-ts'
import { readyStore } from '~/store'
import icon from '~/assets/icon.png'

const initialVolume = 0
let volumes: { [tabId: number]: number } = {}

const getSettings = async () => {
  const store = await readyStore()
  return JSON.parse(JSON.stringify(store.state.settings))
}

const setIcon = async (tabId: number) => {
  await browser.pageAction.setIcon({ tabId, path: icon })
}

const contentLoaded = async (tabId: number) => {
  const volume = volumes[tabId] ?? initialVolume
  volumes = { ...volumes, [tabId]: volume }

  await setIcon(tabId)
  await browser.pageAction.show(tabId)

  const settings = await getSettings()

  return { volume, settings }
}

const popupLoaded = async (tabId: number) => {
  const volume = volumes[tabId] ?? initialVolume

  return { volume }
}

const updateVolume = async (tabId: number, volume: number) => {
  volumes = {
    ...volumes,
    [tabId]: volume,
  }

  await browser.tabs.sendMessage(tabId, {
    id: 'volumeChanged',
    data: { volume },
  })
}

const settingsChanged = async () => {
  const settings = await getSettings()
  const tabs = await browser.tabs.query({})
  for (const tab of tabs) {
    try {
      tab.id &&
        (await browser.tabs.sendMessage(tab.id, {
          id: 'settingsChanged',
          data: { settings },
        }))
    } catch (e) {} // eslint-disable-line no-empty
  }
}

const getCurrentTab = async () => {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  })
  return tabs[0]
}

browser.runtime.onMessage.addListener(async (message, sender) => {
  const { id, data } = message
  const { tab } = sender
  switch (id) {
    case 'contentLoaded':
      return tab?.id && (await contentLoaded(tab.id))
    case 'popupLoaded': {
      const tab = await getCurrentTab()
      return tab?.id && (await popupLoaded(tab.id))
    }
    case 'volumeChanged': {
      const { volume } = data
      const tab = await getCurrentTab()
      tab?.id && (await updateVolume(tab.id, volume))
      break
    }
    case 'settingsChanged':
      await settingsChanged()
      break
  }
})
