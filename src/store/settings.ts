import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import Settings, { AuthorType } from '~/models/settings'

const initialTypes: AuthorType[] = [
  'guest',
  'member',
  'moderator',
  'owner',
  'super_chat',
]

const initialVoice: Omit<Settings, 'enabledTypes'> = {
  voiceURI: '',
  truncateMessageLength: 32,
  rate: 1,
  queueMessages: 5,
  quickRate: 1.5,
  quickQueueMessages: 3,
}

@Module({ name: 'settings' })
export default class SettingsModule extends VuexModule {
  enabledTypes = [...initialTypes]
  voiceURI = initialVoice.voiceURI
  truncateMessageLength = initialVoice.truncateMessageLength
  rate = initialVoice.rate
  queueMessages = initialVoice.queueMessages
  quickRate = initialVoice.quickRate
  quickQueueMessages = initialVoice.quickQueueMessages

  @Mutation
  setEnabledTypes({ enabledTypes }: { enabledTypes: AuthorType[] }) {
    this.enabledTypes = enabledTypes
  }
  @Mutation
  setVoiceURI({ voiceURI }: { voiceURI: string }) {
    this.voiceURI = voiceURI
  }
  @Mutation
  setTruncateMessageLength({
    truncateMessageLength,
  }: {
    truncateMessageLength: number
  }) {
    this.truncateMessageLength = truncateMessageLength
  }
  @Mutation
  setRate({ rate }: { rate: number }) {
    this.rate = rate
  }
  @Mutation
  setQueueMessages({ queueMessages }: { queueMessages: number }) {
    this.queueMessages = queueMessages
  }
  @Mutation
  setQuickRate({ quickRate }: { quickRate: number }) {
    this.quickRate = quickRate
  }
  @Mutation
  setQuickQueueMessages({
    quickQueueMessages,
  }: {
    quickQueueMessages: number
  }) {
    this.quickQueueMessages = quickQueueMessages
  }
  @Mutation
  resetEnabledTypes() {
    this.enabledTypes = [...initialTypes]
  }
  @Mutation
  resetVoice() {
    for (const [k, v] of Object.entries(initialVoice)) {
      ;(this as any)[k] = v // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }
}
