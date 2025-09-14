/**
 * 浏览量相关工具函数
 */

// 格式化数字的函数，将较大数字转换为带k、w的格式，保留两位小数
export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    const wan = (num / 10000).toFixed(2)
    return `${wan}w`
  } else if (num >= 1000) {
    const qian = (num / 1000).toFixed(2)
    return `${qian}k`
  }
  return num.toString()
}

// 处理数字的辅助函数，确保返回数字类型
export const normalizeNumber = (num: any): number => {
  if (num === null || num === undefined) return 0
  if (typeof num === 'string') {
    const parsed = parseInt(num, 10)
    return isNaN(parsed) ? 0 : parsed
  }
  if (typeof num === 'number') {
    return num
  }
  return 0
}

// 本地存储浏览量的key前缀
const VIEW_COUNT_CACHE_PREFIX = 'view_count_cache_'

// 缓存浏览量数据，避免频繁请求
export const cacheViewCount = (pictureId: number, viewCount: number) => {
  try {
    const key = `${VIEW_COUNT_CACHE_PREFIX}${pictureId}`
    const data = {
      viewCount,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('缓存浏览量失败:', error)
  }
}

// 获取缓存的浏览量
export const getCachedViewCount = (pictureId: number): number | null => {
  try {
    const key = `${VIEW_COUNT_CACHE_PREFIX}${pictureId}`
    const cached = localStorage.getItem(key)
    if (cached) {
      const data = JSON.parse(cached)
      // 缓存5分钟内的数据
      if (Date.now() - data.timestamp < 5 * 60 * 1000) {
        return data.viewCount
      }
    }
  } catch (error) {
    console.warn('获取缓存浏览量失败:', error)
  }
  return null
}

// 清除过期的浏览量缓存
export const clearExpiredViewCountCache = () => {
  try {
    const keys = Object.keys(localStorage)
    const now = Date.now()
    
    keys.forEach(key => {
      if (key.startsWith(VIEW_COUNT_CACHE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          // 清除超过10分钟的缓存
          if (now - data.timestamp > 10 * 60 * 1000) {
            localStorage.removeItem(key)
          }
        } catch (error) {
          // 如果解析失败，直接删除
          localStorage.removeItem(key)
        }
      }
    })
  } catch (error) {
    console.warn('清除浏览量缓存失败:', error)
  }
}

// 定时清理缓存
setInterval(clearExpiredViewCountCache, 5 * 60 * 1000) // 每5分钟清理一次 