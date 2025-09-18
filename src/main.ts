import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { handleBackButton } from '@/utils/back.ts'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import '@/access.ts'
import VueCropper from 'vue-cropper'
import 'vue-cropper/dist/index.css'
// import { message } from 'ant-design-vue'
import "vue3-emoji-picker/css";
import { addUserSignInUsingPost } from '@/api/userController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { watch } from 'vue'

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
// 使用nextTick确保在DOM更新后（也就是应用挂载完成后）执行后续逻辑
import { nextTick } from 'vue'
nextTick(() => {
  handleBackButton()
    .then(() => {
      // 这里可以添加一些后续逻辑，比如确认返回键处理逻辑添加成功后的提示等，目前为空
    })
    .catch((error) => {
      console.error('处理返回键时出现错误:', error)
    })
})
