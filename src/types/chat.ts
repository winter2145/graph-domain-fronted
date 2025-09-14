export interface ChatMessage {
  id?: string
  content: string
  senderId: string
  senderName?: string
  senderAvatar?: string
  createTime?: string
  pictureId?: string
  spaceId?: string
  privateChatId?: string
  replyId?: string | null
  rootId?: string | null
  type?: number
}
