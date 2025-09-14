/**
 * 分享次数限制工具 - 后端策略：每人每张图片每小时最多分享 3 次
 *
 * 前端在分享前应调用 canShare(itemId) 来判断是否允许分享；
 * 分享完成后调用 incrementShareCount(itemId) 更新本地记录（后端仍以服务端校验为准）。
 */

const SHARE_LIMIT_PREFIX = 'hourly_share_timestamps_'
const MAX_SHARES_PER_HOUR = 3
const HOUR_MS = 60 * 60 * 1000

function now(): number {
  return Date.now()
}

function storageKey(itemId: number | string): string {
  return `${SHARE_LIMIT_PREFIX}${itemId}`
}

function safeParseTimestamps(raw: string | null): number[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter(v => typeof v === 'number')
    }
  } catch (e) {
    // ignore and return empty
  }
  return []
}

function cleanOldTimestamps(timestamps: number[]): number[] {
  const threshold = now() - HOUR_MS
  return timestamps.filter(ts => ts >= threshold)
}

/**
 * 获取指定图片最近1小时的分享时间戳数组（已清理老数据）
 */
export function getLastHourTimestamps(itemId: number | string): number[] {
  const key = storageKey(itemId)
  const raw = localStorage.getItem(key)
  const arr = safeParseTimestamps(raw)
  const cleaned = cleanOldTimestamps(arr)
  // 如果有清理，写回保持本地数据干净
  if (cleaned.length !== arr.length) {
    try {
      localStorage.setItem(key, JSON.stringify(cleaned))
    } catch (e) {
      // noop
    }
  }
  return cleaned
}

/**
 * 获取指定图片在最近1小时内的分享次数
 */
export function getShareCountLastHour(itemId: number | string): number {
  return getLastHourTimestamps(itemId).length
}

/**
 * 增加指定图片的分享记录（加入当前时间戳），并返回新的次数
 */
export function incrementShareCount(itemId: number | string): number {
  const key = storageKey(itemId)
  const timestamps = getLastHourTimestamps(itemId)
  const newTimestamps = timestamps.concat([now()])
  try {
    localStorage.setItem(key, JSON.stringify(newTimestamps))
  } catch (e) {
    // ignore storage errors
  }
  return newTimestamps.length
}

/**
 * 检查指定图片是否可以分享（最近1小时内次数 < MAX_SHARES_PER_HOUR）
 */
export function canShare(itemId: number | string): boolean {
  return getShareCountLastHour(itemId) < MAX_SHARES_PER_HOUR
}

/**
 * 获取指定图片剩余可分享次数
 */
export function getRemainingShares(itemId: number | string): number {
  const current = getShareCountLastHour(itemId)
  return Math.max(0, MAX_SHARES_PER_HOUR - current)
}

/**
 * 清除所有分享计数（用于测试或特殊情况）
 */
export function clearAllShareCounts(): void {
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith(SHARE_LIMIT_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}

/**
 * 重置指定图片的分享记录（用于测试或特殊情况）
 */
export function resetShareCount(itemId: number | string): void {
  const key = storageKey(itemId)
  localStorage.removeItem(key)
}

/**
 * 获取分享限制信息（用于调试）
 */
export function getShareLimitInfo(itemId: number | string): {
  windowMs: number
  itemId: number | string
  currentCount: number
  maxShares: number
  canShare: boolean
  remaining: number
  timestamps: number[]
} {
  const timestamps = getLastHourTimestamps(itemId)
  const current = timestamps.length
  return {
    windowMs: HOUR_MS,
    itemId,
    currentCount: current,
    maxShares: MAX_SHARES_PER_HOUR,
    canShare: current < MAX_SHARES_PER_HOUR,
    remaining: Math.max(0, MAX_SHARES_PER_HOUR - current),
    timestamps
  }
}

/**
 * 获取所有图片的分享统计信息（用于调试）
 */
export function getAllShareStats(): Array<{
  itemId: string
  count: number
  remaining: number
}> {
  const stats: Array<{ itemId: string; count: number; remaining: number }> = []
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith(SHARE_LIMIT_PREFIX)) {
      const itemId = key.replace(SHARE_LIMIT_PREFIX, '')
      const timestamps = safeParseTimestamps(localStorage.getItem(key))
      const cleaned = cleanOldTimestamps(timestamps)
      stats.push({
        itemId,
        count: cleaned.length,
        remaining: Math.max(0, MAX_SHARES_PER_HOUR - cleaned.length)
      })
      // write back cleaned
      try {
        localStorage.setItem(key, JSON.stringify(cleaned))
      } catch (e) {
        // noop
      }
    }
  })
  return stats
}