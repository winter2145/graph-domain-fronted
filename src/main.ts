import { createApp, h, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { handleBackButton } from '@/utils/back.ts'
import App from './App.vue'
import router from './router'
import Antd, { message } from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import '@/access.ts'
import VueCropper from 'vue-cropper'
import 'vue-cropper/dist/index.css'
// import { message } from 'ant-design-vue'
import "vue3-emoji-picker/css";
import { addUserSignInUsingPost } from '@/api/userController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { watch } from 'vue'
import { CloseOutlined } from '@ant-design/icons-vue'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(Antd)
app.use(VueCropper)

window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled Promise Rejection:', event.reason)
})

// 自动签到：只在用户首次登录时触发一次
const loginUserStore = useLoginUserStore()

// helper: check and set per-user signed flag in localStorage
function hasSignedForUser(userId: any) {
  if (!userId) return false
  try {
    return !!localStorage.getItem(`signedInForUser:${userId}`)
  } catch (e) {
    return false
  }
}
function markSignedForUser(userId: any) {
  if (!userId) return
  try {
    localStorage.setItem(`signedInForUser:${userId}`, '1')
  } catch (e) {
    // ignore
  }
}

async function trySignInForUser(userId: any) {
  if (!userId) return
  if (hasSignedForUser(userId)) return
  try {
    const res = await addUserSignInUsingPost()
    if (res?.data?.code === 0) {
      markSignedForUser(userId)
    }
  } catch (e) {
    console.error('自动签到失败:', e)
  }
}

// 监听 loginUser 变化：当用户从未登录变为已登录时尝试签到（仅一次）
watch(
  () => loginUserStore.loginUser && loginUserStore.loginUser.id,
  (id, oldId) => {
    if (id && id !== oldId) {
      trySignInForUser(id)
    }
  }
)

// 挂载应用
app.mount('#app')
// 使用 nextTick 确保在 DOM 更新后（也就是应用挂载完成后）执行后续逻辑
nextTick(() => {
  handleBackButton()
    .then(() => {
      // 这里可以添加一些后续逻辑，比如确认返回键处理逻辑添加成功后的提示等，目前为空
    })
    .catch((error) => {
      console.error('处理返回键时出现错误:', error)
    })
  // 覆盖全局 message.error 为可点击任意处关闭且包含 Close 图标的样式
  const originalError = message.error
  message.error = ((content: any, duration?: number, onClose?: any) => {
    const key = `global-err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const node = h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a1a' } },
      [
        h(CloseOutlined, { style: { color: '#ff4d4f', fontSize: '18px' } }),
        typeof content === 'string' ? content : String(content),
      ],
    )

    message.open({ content: node, key, duration: 0 })

    const onDocClick = () => {
      message.destroy(key)
      document.removeEventListener('click', onDocClick, true)
    }

    document.addEventListener('click', onDocClick, true)

    // 调用原始实现以满足返回类型和兼容性（但仍以自定义节点显示）
    try {
      return originalError(content, duration, onClose) as any
    } catch (e) {
      return originalError(content) as any
    }
  }) as any
})
