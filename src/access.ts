import router from '@/router';
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts';
import { message } from 'ant-design-vue';
import { generateRedirectUrl, getSafeRedirectPath } from '@/utils/redirectUtils';

// 是否为首次获取登录用户
// 是否为首次获取登录用户
let firstFetchLoginUser = true;
/**
 * 全局权限校验，每次切换页面时都会执行
 */
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore();
  let loginUser = loginUserStore.loginUser;
  // 确保页面刷新时，首次加载时，能等待后端返回用户信息后再校验权限
  if (firstFetchLoginUser) {
    // 在首次获取用户信息期间，设置全局标志以避免请求拦截器触发自动重定向
    ;(window as any).__IS_FETCHING_LOGIN_USER__ = true
    await loginUserStore.fetchLoginUser();
    loginUser = loginUserStore.loginUser;
    firstFetchLoginUser = false;
    ;(window as any).__IS_FETCHING_LOGIN_USER__ = false
  }
  
  // 如果用户已登录但访问登录页，则直接跳回原始跳转或首页
  if (to.path.includes('/user/login')) {
    if (loginUser && (loginUser as any).id) {
      const redirectQuery = (to.query?.redirect as string) || ''
      const decoded = redirectQuery ? decodeURIComponent(redirectQuery) : ''
      const target = decoded ? getSafeRedirectPath(decoded, '/') : '/'
      next(target)
      return
    }
  }
  const toUrl = to.fullPath;
  
  // 检查需要登录的页面
  if (to.meta?.needLogin) {
    if (!loginUser || !loginUser.id) {
      next(generateRedirectUrl(toUrl));
      return;
    }
  }
  
  // 可以自己定义权限校验逻辑，比如管理员才能访问 /admin 开头的页面
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || loginUser.userRole!== 'admin') {
      message.error('没有权限');
      next(generateRedirectUrl(toUrl));
      return;
    }
  }
  next();
});
