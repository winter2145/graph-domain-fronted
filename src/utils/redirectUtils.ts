
/* 重定向URL工具函数*/
/**
 * 生成重定向URL
 * @param targetPath 目标路径，默认为当前页面
 * @returns 完整的重定向URL
 */
export const generateRedirectUrl = (targetPath?: string): string => {
  const currentUrl = targetPath || window.location.href
  return `/user/login?redirect=${encodeURIComponent(currentUrl)}`
}

/**
 * 验证重定向URL的安全性
 * @param redirectUrl 重定向URL
 * @returns 是否安全
 */
export const isRedirectUrlSafe = (redirectUrl: string): boolean => {
  try {
    const redirectUrlObj = new URL(redirectUrl)
    const currentUrlObj = new URL(window.location.href)
    
    // 只允许同域名跳转，防止恶意重定向
    return redirectUrlObj.origin === currentUrlObj.origin
  } catch (error) {
    // URL解析失败，认为不安全
    return false
  }
}

/**
 * 获取安全的跳转路径
 * @param redirectUrl 重定向URL
 * @param fallbackPath 默认跳转路径
 * @returns 安全的跳转路径
 */
export const getSafeRedirectPath = (redirectUrl: string, fallbackPath: string = '/home'): string => {
  if (!redirectUrl) {
    return fallbackPath
  }
  
  if (isRedirectUrlSafe(redirectUrl)) {
    try {
      const url = new URL(redirectUrl)
      return url.pathname + url.search + url.hash
    } catch (error) {
      return fallbackPath
    }
  }
  
  return fallbackPath
} 