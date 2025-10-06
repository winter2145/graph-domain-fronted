import { createRouter, createWebHistory } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { generateRedirectUrl } from '@/utils/redirectUtils'
import { getDeviceType } from '@/utils/device'
import SpaceUserManagePage from '@/pages/admin/SpaceUserManagePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
      meta: {
        keepAlive: true,
      },
    },
    {
      path: '/home',
      name: 'myhome',
      component: () => import('@/pages/HomePage.vue'),
      meta: {
        keepAlive: true,
      },
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: () => import('@/pages/user/UserLoginPage.vue'),
      meta: {
        keepAlive: false,
      },
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: () => import('@/pages/user/UserRegisterPage.vue'),
      meta: {
        keepAlive: false,
      },
    },
    {
      path: '/user/setting',
      name: '用户设置',
      component: () => import('@/views/SettingView.vue'),
      meta: {
        keepAlive: false,
        needLogin: true,
      },
    },
    {
      path: '/add_picture',
      name: '创建图片',
      component: () => import('@/pages/AddPicturePage.vue'),
      meta: {
        keepAlive: false,
      },
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: () => import('@/pages/admin/UserManagePage.vue'),
      meta: {
        keepAlive: false,
        needLogin: true,
      },
    },
    {
      path: '/admin/pictureManage',
      name: '图片管理',
      component: () => import('@/pages/admin/PictureManagePage.vue'),
      meta: {
        keepAlive: false,
        needLogin: true,
      },
    },
    {
      path: '/admin/spaceManage',
      name: '空间管理',
      component: () => import('@/pages/admin/SpaceManagePage.vue'),
      meta: {
        keepAlive: false,
        needLogin: true,
      },
    },
    {
      path: '/add_space',
      name: '创建空间',
      component: () => import('@/pages/AddSpacePage.vue'),
      meta: {
        keepAlive: false,
        needLogin: true,
      },
    },
    {
      path: '/my_space',
      name: '我的空间',
      component: () => import('@/pages/MySpacePage.vue'),
      meta: {
        keepAlive: false,
        needLogin: true,
      },
    },
    {
      path: '/space/:id',
      name: '空间详情',
      component: () => import('@/pages/SpaceDetailPage.vue'),
      props: true,
      meta: {
        keepAlive: false,
      },
    },
    {
      path: '/spaceUserManage/:id',
      name: '空间成员管理',
      component: () => import('@/pages/admin/SpaceUserManagePage.vue'),
      props: true,
      
    },
    {
      path: '/my_ports',
      name: '我的发布',
      component: () => import('@/pages/MyPostsPage.vue'),
      props: true,
      meta: {
        keepAlive: false,
        needLogin: true,
      },
    },
    {
      path: '/my_teams',
      name: '我的团队',
      component: () => import('@/pages/MyTeamsPage.vue'),
      meta: {
        title: '我的团队',
        needLogin: true,
      },
    },
    {
      path: '/my',
      name: '我的',
      component: () => import('@/pages/MyPage.vue'),
      meta: {
        keepAlive: false,
        mobileOnly: true,
      },
    },
    {
      path: '/space_analyze',
      name: '空间分析',
      component: () => import('@/pages/SpaceAnalyzePage.vue'),
      meta: {
        keepAlive: false,
        needLogin: true,
      },
    },
    {
      path: '/search_picture',
      name: '图片搜索',
      component: () => import('@/pages/SearchPicturePage.vue'),
      meta: {
        keepAlive: false,
      },
    },
    {
      path: '/admin/tagManage',
      name: '标签管理',
      component: () => import('@/pages/admin/TagManagePage.vue'),
      meta: {
        keepAlive: false,
      },
    },
    {
      path: '/admin/pointManage',
      name: '积分管理',
      component: () => import('@/pages/admin/PointManagePage.vue'),
      meta: {
        keepAlive: false,
        needLogin: true,
      },
    },
    {
      path: '/admin/categoryManage',
      name: '分类管理',
      component: () => import('@/pages/admin/CategoryManagePage.vue'),
      meta: {
        keepAlive: false,
      },
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: () => import('@/pages/PictureDetailPage.vue'),
      props: true,
      meta: {
        keepAlive: false,
      },
    },
    {
      path: '/add_picture/batch',
      name: '批量创建图片',
      component: () => import('@/pages/AddPictureBatchPage.vue'),
      meta: {
        keepAlive: false,
      },
    },
    {
      path: '/follow-list',
      name: '关注列表',
      component: () => import('@/pages/FollowListPage.vue'),
      meta: {
        keepAlive: false,
      },
    },
    {
      path: '/user/:id',
      name: '用户详情',
      component: () => import('@/pages/UserDetailPage.vue'),
      props: true,
      meta: {
        keepAlive: false,
      },
    },
    {
      path: '/search',
      name: '搜索',
      component: () => import('@/pages/SearchPage.vue'),
      meta: {
        title: '搜索'
      }
    },
    {
      path: '/space_chat/:id',
      name: '团队聊天室',
      component: () => import('@/pages/SpaceChatPage.vue')
    },
    {
      path: '/chat/:userId?',
      name: '私聊',
      component: () => import('@/pages/ChatPage.vue'),
      props: true,
      meta: {
        keepAlive: false,
        needLogin: true
      }
    },
    {
      path: '/ai_draw',
      name: 'ai绘图',
      component: () => import('@/pages/AiDrawPage.vue'),
      meta: {
        keepAlive: false,
        needLogin: true
      }
    },
    {
      path: '/chat-list',
      name: '聊天列表',
      component: () => import('@/pages/ChatListPage.vue'),
      meta: {
        keepAlive: false,
        needLogin: true
      }
    },
    {
      path: '/message-center',
      name: 'messageCenter',
      component: () => import('@/pages/MessageCenterPage.vue'),
      meta: {
        keepAlive: false,
        needLogin: true
      }
    },
    {
      path: '/message/history',
      name: 'InteractionHistory',
      component: () => import('@/pages/InteractionHistoryPage.vue'),
      meta: {
        keepAlive: false,
        needLogin: true
      }
    },
    {
      path: '/user/reset-password',
      name: '重置密码',
      component: () => import('@/pages/user/UserResetPasswordPage.vue'),
      meta: {
        keepAlive: false,
      },
    },
    {
    path: '/:pathMatch(.*)*',   // 任意不匹配路径都会落到这里
    name: '404',
    component: () => import('@/views/NotFound.vue')
  }
  ],
})

// 用于存储上一个路由信息的变量，初始化为 null，类型为 RouteLocationNormalizedLoaded | null
let prevRoute: any | null

// 全局前置导航守卫，在每次路由跳转前记录上一个路由
router.beforeEach(async (to, from, next): Promise<void> => {

  prevRoute = from
  // 路由切换时清理全局滚动监听器
  window.onscroll = null
  // 移除所有滚动事件监听器
  const oldScrollListeners = ((window as any).listeners?.scroll) || []
  oldScrollListeners.forEach((listener: any) => {
    window.removeEventListener('scroll', listener)
  })

  // 如果路由声明需要登录，则校验当前登录态
  // 屏蔽仅移动端的路由：如果路由声明了 mobileOnly 且检测到是 PC，则重定向到首页
  try {
    const deviceType = getDeviceType()
    if (to.meta?.mobileOnly && deviceType === 'pc') {
      next({ path: '/' })
      return
    }
  } catch (e) {
    // ignore device detection errors
  }

  const needLogin = to.meta?.needLogin
  if (needLogin) {
    const loginUserStore = useLoginUserStore()
    // 如果当前已有用户 id，则直接放行
    if (loginUserStore.loginUser?.id) {
      next()
      return
    }

    // 否则尝试远程获取登录用户（会设置全局 __IS_FETCHING_LOGIN_USER__ 标志）
    try {
      const logged = await loginUserStore.fetchLoginUser()
      if (logged) {
        next()
        return
      }
    } catch (err) {
      // ignore and treat as not logged
    }

    // 未登录，跳转到登录页并携带重定向参数
    const redirectUrl = generateRedirectUrl(window.location.href)
    window.location.href = redirectUrl
    return
  }

  next()
})

export default router
export { prevRoute }
