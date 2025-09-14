<template>
  <div class="share-limit-test">
    <a-card title="分享限制测试" style="margin: 20px;">
      <template #extra>
        <a-button @click="resetCount" type="primary" danger>重置当前图片计数</a-button>
      </template>
      
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="测试图片ID">
          {{ shareInfo.itemId }}
        </a-descriptions-item>
        <a-descriptions-item label="窗口时长">
          1 小时
        </a-descriptions-item>
        <a-descriptions-item label="当前分享次数（最近1小时）">
          {{ shareInfo.currentCount }} / {{ shareInfo.maxShares }}
        </a-descriptions-item>
        <a-descriptions-item label="是否可以分享">
          <a-tag :color="shareInfo.canShare ? 'green' : 'red'">
            {{ shareInfo.canShare ? '可以' : '不可以' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="剩余次数">
          {{ shareInfo.remaining }}
        </a-descriptions-item>
      </a-descriptions>

      <!-- 所有图片分享统计 -->
      <div style="margin-top: 20px;">
        <h4>所有图片分享统计</h4>
        <a-table 
          :dataSource="allStats" 
          :columns="[
            { title: '图片ID', dataIndex: 'itemId', key: 'itemId' },
            { title: '分享次数', dataIndex: 'count', key: 'count' },
            { title: '剩余次数', dataIndex: 'remaining', key: 'remaining' }
          ]"
          :pagination="false"
          size="small"
        />
      </div>

      <div style="margin-top: 20px;">
        <a-space>
          <a-button 
            @click="testShare" 
            type="primary"
            :disabled="!shareInfo.canShare"
          >
            测试分享图片 ({{ shareInfo.remaining }}次剩余)
          </a-button>
          <a-button @click="refreshInfo">刷新信息</a-button>
        </a-space>
      </div>

      <div style="margin-top: 20px;">
          <a-alert
          v-if="!shareInfo.canShare"
          message="该图片1小时内分享次数已达上限"
          description="该图片在1小时内最多可分享 3 次，请稍后再试。"
          type="warning"
          show-icon
        />
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  getShareLimitInfo, 
  incrementShareCount, 
  resetShareCount,
  canShare,
  getAllShareStats
} from '@/utils/shareLimit'

const testItemId = ref('test-123')
const shareInfo = ref(getShareLimitInfo(testItemId.value))
const allStats = ref(getAllShareStats())

const refreshInfo = () => {
  shareInfo.value = getShareLimitInfo(testItemId.value)
  allStats.value = getAllShareStats()
}

const testShare = () => {
  if (!canShare(testItemId.value)) {
    message.warning('该图片1小时内分享次数已达上限（3次），请稍后再试。')
    return
  }

  // 模拟分享操作
  const newCount = incrementShareCount(testItemId.value)
  message.success(`分享成功！该图片1小时内还可分享 ${getShareLimitInfo(testItemId.value).remaining} 次`)
  refreshInfo()
}

const resetCount = () => {
  resetShareCount(testItemId.value)
  refreshInfo()
  message.success('这张图片的分享计数已重置')
}

onMounted(() => {
  refreshInfo()
})
</script>

<style scoped>
.share-limit-test {
  max-width: 600px;
  margin: 0 auto;
}
</style> 