export type AuthorType =
  | 'guest'
  | 'member'
  | 'moderator'
  | 'owner'
  | 'super_chat'
  | 'membership'

export default interface Settings {
  enabledTypes: AuthorType[]
  voiceURI: string
  truncateMessageLength: number
  rate: number
  queueMessages: number
  quickRate: number
  quickQueueMessages: number
}
