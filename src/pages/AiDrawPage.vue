<template>
  <div class="ai-draw-page" :class="{ mobile: isMobile }">
    <div class="left-panel" :style="{ width: sidebarOpen ? sidebarWidth + 'px' : '0px' }">
      <div class="left-header">
        <div class="title">AI 绘图</div>
        <a-button type="text" class="new-session-btn" @click="createNewSession">
          <PlusOutlined />
        </a-button>
        <!-- mobile close inside panel so user can always close -->
        <a-button v-if="isMobile" type="text" class="mobile-close" @click="toggleSidebar">
          <CloseOutlined />
        </a-button>
      </div>

      <div class="session-list">
        <a-spin :spinning="loadingSessions">
          <div v-if="sessions.length === 0" class="empty-sessions">
            暂无会话，点击"新会话"开始
          </div>
          <a-list v-else :data-source="sessions" :split="false" class="sessions-list">
            <template #renderItem="{ item }">
              <a-list-item :class="['session-item', { active: currentSession?.id === item.id }]">
                <a-list-item-meta @click="selectSession(item)">
                  <template #title>{{ item.title || `会话 ${item.id}` }}</template>
                  <template #description>{{ item.createTime }}</template>
                </a-list-item-meta>
                <div class="session-actions">
                  <a-button type="text" size="small" class="edit-session-btn" @click.stop="openEditSession(item)">
                    <EditOutlined />
                  </a-button>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-spin>
      </div>
      <!-- resizer handle -->
      <div class="resizer" @mousedown.prevent="startResize" v-show="sidebarOpen && !isMobile"></div>
    </div>

    <!-- mobile overlay mask: clicking closes the sidebar -->
    <div v-if="isMobile && sidebarOpen" class="mobile-mask" @click="toggleSidebar"></div>

    <div class="right-panel" :style="{ marginLeft: sidebarOpen ? '0' : '0' }">
      <div class="chat-header">
        <div class="chat-header-left">
          <a-button type="text" class="sidebar-toggle" @click="toggleSidebar">
            <template v-if="sidebarOpen"><MenuOutlined /></template>
            <template v-else><MenuOutlined /></template>
          </a-button>
        </div>

        <div class="chat-title">{{ currentSession?.title || '新会话' }}</div>

        <div class="chat-header-right">
          <a-button type="text" class="new-session-mobile" @click="createNewSession"><PlusOutlined /></a-button>
        </div>
      </div>

      <div class="chat-body" ref="chatBodyRef">
        <div v-if="loadingMessages" class="loading-messages">
          <a-spin /> 正在加载消息...
        </div>
        <div v-else class="messages">
          <!-- 顶部提示 -->
          <div class="header-actions">
            <template v-if="!hasMore && messages.length > 0 && isAtTop">
              <div class="first-message-tip">已经到顶啦</div>
            </template>
            <template v-else-if="hasMore && isAtTop">
              <a-button
                type="link"
                size="small"
                :loading="loadingMore"
                @click="loadOlderMessages"
                class="load-more-btn"
              >
                <template #icon><UpOutlined /></template>
                加载更多
              </a-button>
            </template>
          </div>
          
          <!-- 使用 div 容器确保正确的消息顺序 -->
          <div class="messages-container">
            <div
              v-for="(m, idx) in messages"
              :key="idx"
              :class="['message-item', m.role === 'assistant' ? 'assistant' : 'user']"
            >
              <div class="message-content">
                <div v-if="m.content" class="message-text" v-html="formatMessage(m.content)"></div>
                <div v-if="m.imageUrl" class="message-image">
                  <img :src="m.imageUrl" alt="ai-image" @click="handleImageClick(m.imageUrl)" />
                  <div class="image-actions">
                    <a-button type="link" size="small" @click="downloadImage(m.imageUrl)">保存</a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
              <a-input
                v-model:value="prompt"
                placeholder="描述你想生成的图像（例如：一只穿宇航服的猫，在月球上漫步，高清、油画风）"
                :disabled="generating || (!currentSession && sessions.length > 0)"
                @keydown.enter.native="handleGenerate"
              />
        <a-button type="primary" :loading="generating" @click="handleGenerate" :disabled="!prompt || (sessions.length > 0 && !currentSession)">
          <template #icon><SendOutlined /></template>
          生成图片
        </a-button>
      </div>
    </div>

    <!-- image preview modal -->
    <a-modal v-model:open="preview.visible" title="图片预览" :footer="null" width="720">
      <div style="text-align:center">
        <img :src="preview.src" style="max-width:100%; max-height:80vh" />
        <div style="margin-top:8px">
          <a-button @click="downloadImage(preview.src)">保存到本地</a-button>
        </div>
      </div>
    </a-modal>

    <!-- edit session modal -->
    <a-modal v-model:open="editModalVisible" title="编辑会话名称" @cancel="closeEditModal" :footer="null">
      <div>
        <a-input v-model:value="editTitle" placeholder="输入新的会话名称" />
        <div style="margin-top:12px; text-align:right">
          <a-button style="margin-right:8px" @click="closeEditModal">取消</a-button>
          <a-button type="primary" @click="saveEditSession">保存</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { LeftOutlined, PlusOutlined, SendOutlined, MenuOutlined, CloseOutlined, EditOutlined, UpOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { getUserSessions, createSession, getMessages, getMessagesByPage, generateImage, updateSessionTitle } from '@/api/aiDrawController'
import { message } from 'ant-design-vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

  const sessions = ref<API.AiChatSessionVO[]>([])
  const loadingSessions = ref(false)
  const currentSession = ref<API.AiChatSessionVO | null>(null)

  // UI states: sidebar open/collapse and resizing
  const sidebarOpen = ref(true)
  const sidebarWidth = ref(320) // px
  const isResizing = ref(false)
  const isMobile = ref(false)

  const messages = ref<API.AiChatMessageVO[]>([])
const loadingMessages = ref(false)
const prompt = ref('')
const generating = ref(false)
const chatBodyRef = ref<HTMLElement | null>(null)
// pagination state for messages
const pageNum = ref(1)
const pageSize = ref(10)
const totalMessages = ref<number | null>(null)
const hasMore = ref(false)
const loadingMore = ref(false)
  // preview modal
  const preview = ref({ visible: false, src: '' })

  // edit session modal
  const editModalVisible = ref(false)
  const editTitle = ref('')
  const editingSession = ref<API.AiChatSessionVO | null>(null)

  // track placeholder for assistant when generating
  const pendingAssistantIndex = ref<number | null>(null)
  
  // 添加是否在顶部的状态
  const isAtTop = ref(false)

function goHome() {
  router.push({ path: '/' })
}

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function handleImageClick(src: string) {
    preview.value.src = src
    preview.value.visible = true
  }

  function openEditSession(session: API.AiChatSessionVO) {
    editingSession.value = session
    editTitle.value = session.title || ''
    editModalVisible.value = true
  }

  async function saveEditSession() {
    if (!editingSession.value) return
    const sessionId = Number(editingSession.value.id)
    const newTitle = String(editTitle.value || '')
    try {
      // updateSessionTitle params typing may not include title in generated types; cast to any
      const res = await (updateSessionTitle as any)({ sessionId, title: newTitle })
      if (res && res.data && res.data.code === 0) {
        // update local list
        const found = sessions.value.find(s => String(s.id) === String(sessionId))
        if (found) found.title = newTitle
        if (currentSession.value && String(currentSession.value.id) === String(sessionId)) {
          currentSession.value.title = newTitle
        }
        message.success('会话名称更新成功')
        editModalVisible.value = false
        editingSession.value = null
      } else {
        message.error('更新会话名称失败')
        console.error('更新会话名称失败', res)
      }
    } catch (e) {
      message.error('更新会话名称异常')
      console.error('更新会话名称异常', e)
    }
  }

function closeEditModal() {
  editModalVisible.value = false
  editingSession.value = null
}

  async function downloadImage(src: string) {
    try {
      const resp = await fetch(src)
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-image-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('下载图片失败', e)
    }
  }

async function loadSessions() {
  const userId = String(loginUserStore.loginUser?.id || '')
  if (!userId) return
  loadingSessions.value = true
  try {
    const res = await getUserSessions({ userId })
    if (res && res.data && res.data.code === 0) {
      sessions.value = res.data.data || []
      // select the first session by default
      if (!currentSession.value && sessions.value.length > 0) {
        selectSession(sessions.value[0])
      }
    }
  } catch (e) {
    console.error('加载会话失败', e)
  } finally {
    loadingSessions.value = false
  }
}

async function createNewSession() {
  const userId = String(loginUserStore.loginUser?.id || '')
  if (!userId) return
  try {
    const res = await createSession({ userId })
    if (res && res.data && res.data.code === 0) {
      // reload sessions and select created one
      await loadSessions()
      // if backend returned the id in data, try to pick it
      const createdId = res.data.data
      if (createdId) {
        const found = sessions.value.find(s => String(s.id) === String(createdId))
        if (found) selectSession(found)
      }
    }
  } catch (e) {
    console.error('创建会话失败', e)
  }
}

async function selectSession(session: API.AiChatSessionVO) {
  // detach previous scroll listener (if any) before switching
  detachChatScrollListener()
  currentSession.value = session
  await loadMessages(session.id || 0)
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

async function loadMessages(sessionId: number) {
  // Backend returns messages in DESC order (newest first). We want to display
  // messages chronologically (oldest -> newest) so newest is at bottom.
  loadingMessages.value = true
  messages.value = []
  pageNum.value = 1
  hasMore.value = false
  try {
    const res = await getMessagesByPage({ sessionId }, ({ current: 1, pageSize: pageSize.value } as any))
    const data = res && res.data && res.data.data
    const extractRecords = (d: any) => {
      if (!d) return []
      if (Array.isArray(d)) return d
      if (d.records && Array.isArray(d.records)) return d.records
      if (d.list && Array.isArray(d.list)) return d.list
      if (d.data && Array.isArray(d.data)) return d.data
      return []
    }
    const records = extractRecords(data) || []
    // backend returns newest->oldest; reverse to display oldest->newest so newest at bottom
    const pageRecords = records.slice().reverse()
    messages.value = pageRecords
    // determine hasMore: if returned page full, there may be older pages
    hasMore.value = records.length === pageSize.value
    pageNum.value = 1
    await nextTick()
    // attach listener after DOM updated
    attachChatScrollListener()
    // scroll to bottom to show newest messages (images/layout may still load)
    scrollToBottom()
  } catch (e) {
    console.error('加载消息失败', e)
  } finally {
    loadingMessages.value = false
  }
}

function attachChatScrollListener() {
  // remove existing
  const el = chatBodyRef.value as any
  if (!el) return
  // ensure we don't attach multiple listeners
  el.removeEventListener('scroll', onChatScroll)
  el.addEventListener('scroll', onChatScroll)
}

function detachChatScrollListener() {
  const el = chatBodyRef.value as any
  if (!el) return
  el.removeEventListener('scroll', onChatScroll)
}

async function loadOlderMessages() {
  if (!currentSession.value) return
  if (!hasMore.value) return
  if (loadingMore.value) return
  const el = chatBodyRef.value as any
  if (!el) return
  loadingMore.value = true
  const prevScrollHeight = el.scrollHeight
  // backend is DESC: page 1 is newest, page 2 older, so to load older messages request pageNum + 1
  const targetPage = pageNum.value + 1
  try {
  const res = await getMessagesByPage({ sessionId: Number(currentSession.value.id) }, ({ current: targetPage, pageSize: pageSize.value } as any))
    const data = res && res.data && res.data.data
    const extractRecords = (d: any) => {
      if (!d) return []
      if (Array.isArray(d)) return d
      if (d.records && Array.isArray(d.records)) return d.records
      if (d.list && Array.isArray(d.list)) return d.list
      if (d.data && Array.isArray(d.data)) return d.data
      return []
    }
    const newRecords = extractRecords(data) || []
    if (newRecords.length > 0) {
      // backend returns page in DESC newest->oldest, reverse page to oldest->newest
      const pageRecords = newRecords.slice().reverse()
      // prepend the older page records
      messages.value = [...pageRecords, ...messages.value]
      pageNum.value = targetPage
      // recompute hasMore: if returned full page, likely more older messages
      hasMore.value = newRecords.length === pageSize.value
      // 保持滚动位置
      await nextTick()
      const newScrollHeight = el.scrollHeight
      el.scrollTop = newScrollHeight - prevScrollHeight
    } else {
      hasMore.value = false
    }
  } catch (e) {
    console.error('加载历史消息失败', e)
  } finally {
    loadingMore.value = false
  }
}

function onChatScroll(e: Event) {
  const el = e.target as HTMLElement
  if (!el) return
  // 判断是否在顶部，允许有1px的误差
  isAtTop.value = el.scrollTop <= 1
  
  // when scrolled near top, load older messages
  if (el.scrollTop <= 80 && hasMore.value && !loadingMore.value) {
    loadOlderMessages()
  }
}

  function scrollToBottom() {
  try {
    const el = (chatBodyRef.value as any)
    if (!el) return
      // wait a tick to allow images and layout to settle so scrollHeight is stable
      setTimeout(() => {
        try {
          el.scrollTop = el.scrollHeight
        } catch (e) {
          // ignore
        }
      }, 100)
  } catch (e) {
    // ignore
  }
}

  // resizing handlers (desktop)
  function startResize(e: MouseEvent) {
    if (isMobile.value) return
    isResizing.value = true
    e.preventDefault()
  }

  function onResizeMove(e: MouseEvent) {
    if (!isResizing.value) return
    const newWidth = Math.max(200, Math.min(600, e.clientX - (document.body.getBoundingClientRect().left || 0)))
    sidebarWidth.value = newWidth
  }

  function stopResize() {
    isResizing.value = false
  }

// renderSessionItem removed in favor of template-based rendering

  function formatMessage(text?: string) {
  if (!text) return ''
  // basic escaping + newline -> <br>
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')
}

async function handleGenerate() {
  if (!prompt.value) return

  // if there's no selected session, create one automatically
  if (!currentSession.value) {
    await createNewSession()
    // try to select first session if backend didn't explicitly return created id
    if (!currentSession.value && sessions.value.length > 0) {
      await selectSession(sessions.value[0])
    }
    if (!currentSession.value) {
      message.error('无法创建会话，请稍后重试')
      return
    }
  }

  // capture prompt and clear input immediately so UI resets
  const currentPrompt = prompt.value
  prompt.value = ''
  // optimistic: push user message immediately (right side)
  const userMsg: API.AiChatMessageVO = {
    role: 'user',
    content: currentPrompt,
    createTime: new Date().toLocaleString(),
  }
  messages.value.push(userMsg)
  // insert assistant placeholder (left side)
  const placeholder: API.AiChatMessageVO = {
    role: 'assistant',
    content: '生成中...',
    createTime: new Date().toLocaleString(),
  }
  const placeholderIndex = messages.value.push(placeholder) - 1
  pendingAssistantIndex.value = placeholderIndex
  generating.value = true
  try {
    const sessionId = Number(currentSession.value.id)
    const userId = String(loginUserStore.loginUser?.id || '')
    const body: API.GenerateImageRequest = { userId, prompt: currentPrompt }
    const res = await generateImage({ sessionId }, body)
    if (res && res.data && res.data.code === 0 && res.data.data) {
      const data = res.data.data
      const newMsg: API.AiChatMessageVO = {
        // prefer explicit role field added to AiGenerateImageVO, fallback to type
        role: (data as any).role || data.type || 'assistant',
        content: data.content || '',
        imageUrl: (data.cosUrl as any) || undefined,
        createTime: new Date().toLocaleString(),
      }
      // replace placeholder
      if (pendingAssistantIndex.value !== null && pendingAssistantIndex.value >= 0 && pendingAssistantIndex.value < messages.value.length) {
        messages.value.splice(pendingAssistantIndex.value, 1, newMsg)
        pendingAssistantIndex.value = null
      } else {
        messages.value.push(newMsg)
      }
      await nextTick()
      scrollToBottom()
    } else {
      // on failure, replace placeholder content with error message
      if (pendingAssistantIndex.value !== null) {
        messages.value[pendingAssistantIndex.value].content = '生成失败，请重试。'
        pendingAssistantIndex.value = null
      }
      console.error('生成图片失败', res)
    }
  } catch (e) {
    if (pendingAssistantIndex.value !== null) {
      messages.value[pendingAssistantIndex.value].content = '生成异常，请检查网络。'
      pendingAssistantIndex.value = null
    }
    console.error('生成图片异常', e)
  } finally {
    generating.value = false
  }
}

onMounted(async () => {
  await loadSessions()
  // detect mobile
  isMobile.value = window.innerWidth <= 900
  // on mobile default: keep sidebar closed (show chat area), on desktop open
  sidebarOpen.value = !isMobile.value
  // global resize handlers
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', stopResize)
})
// cleanup
onUnmounted(() => {
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', stopResize)
  detachChatScrollListener()
})
</script>

<style scoped>
.ai-draw-page {
  display: flex;
  height: calc(100vh - 56px);
  gap: 1px;
  padding: 1px;
  box-sizing: border-box;
  overflow: hidden;
}
.left-panel {
  width: 320px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.left-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.left-header .title { flex: 1; font-weight: 600 }
.session-list { padding: 8px; overflow-y: auto; flex: 1 }
.session-item { cursor: pointer; padding: 8px 12px; border-radius: 6px; }
.session-item.active { background: rgba(115,209,61,0.06) }

.session-actions { margin-left: auto; display:flex; align-items:center }
.edit-session-btn { color: rgba(0,0,0,0.45) }

.resizer {
  width: 6px;
  cursor: col-resize;
  background: linear-gradient(90deg, rgba(0,0,0,0.03), rgba(0,0,0,0.06));
  position: relative;
}

.ai-draw-page.mobile .left-panel {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 200; /* higher than header title */
  transform: translateX(0);
  transition: transform 0.25s ease;
}
.ai-draw-page.mobile .left-panel[style*="width: 0px"] {
  transform: translateX(-100%);
}

.toggle-btn { margin-left: 8px }

.left-panel { display:flex; flex-direction: column }
.ai-draw-page.mobile .left-panel { height: 100% }
.session-list { flex: 1; overflow: auto }

.mobile-mask { position: fixed; left: 0; top: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.35); z-index: 20 }

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  overflow: hidden;
}
.chat-header { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center; position: relative }
.chat-header-left { display:flex; align-items:center; gap:8px; z-index: 31 }
.chat-header-right { display:flex; align-items:center; gap:8px; z-index: 31 }
/* 聊天标题绝对居中 */
.chat-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 600;
  z-index: 20; /* lower than mobile panel */
}
/* 空会话列表居中显示 */
.empty-sessions {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  color: #999;
}

.sidebar-toggle { font-size: 18px }
.new-session-mobile { font-size: 18px }
.chat-body { 
  flex: 1; 
  padding: 16px; 
  overflow-y: auto; 
  background: #fafafa;
  display: flex;
  flex-direction: column;
}
.messages { 
  display: flex;
  flex-direction: column;
  flex: 1;
}
.messages-container {
  display: flex;
  flex-direction: column-reverse;
  flex: 1;
}
.message-item { max-width: 720px }
.message-item.user { align-self: flex-end }
.message-item.assistant { align-self: flex-start }
.message-content { background: white; padding: 12px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.04) }
.message-text { white-space: pre-wrap }
.message-image img { max-width: 560px; border-radius: 6px; display:block }
.image-actions { margin-top: 6px }
.chat-input { padding: 12px; border-top: 1px solid #f0f0f0; display:flex; gap:8px; align-items:center }

/* 添加顶部提示样式 */
.header-actions {
  padding: 8px;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
  background: transparent;
  order: 2; /* 确保在底部 */
}

.load-more-btn {
  font-size: 13px;
  padding: 4px 12px;
  height: 28px;
  border-radius: 14px;
  transition: all 0.3s ease;
  color: #666;
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(4px);
  width: fit-content;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.load-more-btn:hover {
  color: #1890ff;
  transform: translateY(-1px);
}

.load-more-btn:active {
  transform: translateY(0);
}

/* 顶部提示样式 */
.first-message-tip {
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  margin: 0 auto;
  width: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

@media (max-width: 900px) {
  .ai-draw-page { flex-direction: column; height: calc(100vh - 56px) }
  .left-panel { width: 100%; height: 100% }
  .right-panel { flex: 1 }
  .message-image img { max-width: 100% }
}
</style>

/* global override: when AiDrawPage is inside BasicLayout's content, remove extra padding
   so the page fills the available area and avoids the top whitespace from BasicLayout */
<style>
#basicLayout .content > .ai-draw-page {
  /* pull the page up/left to compensate the parent's 28px padding so it visually fills the area */
  position: relative !important;
  top: -28px !important;
  left: -28px !important;
  width: calc(100% + 56px) !important;
  padding: 0 !important;
  margin: 0 !important;
  min-height: calc(100vh - 56px) !important;
}
</style>
