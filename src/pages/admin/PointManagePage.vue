<template>
  <div id="pointManagePage">

    <div class="search-and-add-container">
    <h2>积分管理</h2>
      <a-input-search
        v-model:value="searchUserId"
        placeholder="输入用户ID搜索"
        addon-before="用户 ID"
        enter-button
        @search="doSearch"
        style="max-width:300px"
      />
      <div />
    </div>

    <a-table :dataSource="pointsList" :pagination="false" rowKey="userId" class="point-table">
      <a-table-column title="序号" key="index">
        <template #customRender="{ index }">{{ index + 1 + (searchParams.current - 1) * searchParams.pageSize }}</template>
      </a-table-column>
      <a-table-column title="用户ID" dataIndex="userId" key="userId" />
      <a-table-column title="可用积分" dataIndex="availablePoints" key="availablePoints" />
      <a-table-column title="总积分" dataIndex="totalPoints" key="totalPoints" />
      <a-table-column title="操作" key="action">
        <template #customRender="{ record }">
          <a-button type="link" @click=" openLogs(record.userId);">查看流水</a-button>
        </template>
      </a-table-column>
    </a-table>

    <div class="pagination-container" style="margin-top:12px; text-align:right;">
      <a-pagination
        v-model:current="searchParams.current"
        :page-size-options="pcPageSizeOptions"
        :total="total"
        show-size-changer
        :page-size="searchParams.pageSize"
        @change="onPageChange"
        @showSizeChange="onShowSizeChange"
      >
        <template #buildOptionText="props">
          <span>{{ props.value }}条/页</span>
        </template>
      </a-pagination>
    </div>

    <a-modal v-model:open="logsModalVisible" title="用户积分流水" :footer="null" width="720">
      <div style="padding:12px 0">
        <div style="padding:0 12px">
          <h4 style="margin:0 0 8px 0">积分流水</h4>
          <a-list :dataSource="pointsLogs" bordered>
            <template #renderItem="{ item }">
              <a-list-item>
                <div style="color:#64748b; min-width:180px">{{ formatTime(item.createTime) }}</div>
                <div style="color:#1a1a1a; font-weight:500; flex:1; text-align:center">{{ item.changePoints }}</div>
                <div style="color:#64748b; font-style:italic; flex:1; text-align:right">{{ item.remark || '-' }}</div>
              </a-list-item>
            </template>
          </a-list>
          <div style="text-align:center; padding:12px 0;">
            <a-button v-if="logsHasMore && !logsLoadingMore" @click="loadMoreLogs">加载更多</a-button>
            <a-spin v-else-if="logsLoadingMore" />
            <div v-else style="color:#94a3b8;">没有更多记录</div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { getPointsInfoListUsingPost, getUserPointsLogsUsingGet } from '@/api/pointsController'

type PointItem = {
  userId: string
  availablePoints: number
  totalPoints: number
}

const searchUserId = ref('')
const pointsList = ref<PointItem[]>([])
const total = ref(0)
const pcPageSizeOptions = ['5','8','10','20','50']

const searchParams = reactive({ current: 1, pageSize: 8 })

const logsModalVisible = ref(false)
const currentUserId = ref<string | null>(null)
const pointsLogs = ref<any[]>([])
const logsPage = ref(1)
const logsPageSize = ref(10)
const logsHasMore = ref(true)
const logsLoadingMore = ref(false)

const formatTime = (t: string | number) => {
  if (!t) return '-'
  return new Date(t).toLocaleString()
}

// template handles index and action rendering via slots

const doSearch = () => {
  searchParams.current = 1
  getList()
}

const getList = async () => {
  try {
    const params: any = { current: searchParams.current,
         pageSize: Number(searchParams.pageSize) }
    if (searchUserId.value && String(searchUserId.value).trim() !== '') params.userId = searchUserId.value
    const res = (await getPointsInfoListUsingPost(params)) as any
    if (res && res.data && res.data.code === 0 && res.data.data) {
      pointsList.value = res.data.data.records || []
      total.value = Number(res.data.data.total || 0)
    } else {
      message.error('获取积分列表失败')
    }
  } catch (err) {
    console.error(err)
    message.error('获取积分列表失败')
  }
}

const onPageChange = (page: number, pageSize?: number) => {
  searchParams.current = page
  if (pageSize) searchParams.pageSize = pageSize
  getList()
}

const onShowSizeChange = (current: number, pageSize: number) => {
  searchParams.current = 1
  searchParams.pageSize = pageSize
  getList()
}

const openLogs = (userId: string) => {
  currentUserId.value = userId
  logsModalVisible.value = true
  // reset
  pointsLogs.value = []
  logsPage.value = 1
  logsHasMore.value = true
  loadMoreLogs()
}

const loadMoreLogs = async () => {
  if (!currentUserId.value) return
  if (!logsHasMore.value) return
  logsLoadingMore.value = true
  try {
    const params: any = { userId: currentUserId.value,
         pageNum: Number(logsPage.value), pageSize: Number(logsPageSize.value) }
    const res = (await getUserPointsLogsUsingGet(params)) as any
    if (res && res.data && res.data.code === 0 && res.data.data) {
      const list = res.data.data.records || res.data.data || []
      if (Array.isArray(list)) {
        pointsLogs.value.push(...list)
        if (list.length < logsPageSize.value) {
          logsHasMore.value = false
        } else {
          logsPage.value += 1
        }
      } else {
        logsHasMore.value = false
      }
    } else {
      message.error('获取积分流水失败')
    }
  } catch (err) {
    console.error(err)
    message.error('获取积分流水失败')
  } finally {
    logsLoadingMore.value = false
  }
}

getList()
</script>

<style scoped>
.search-and-add-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.point-table { background: #fff }
.pagination-container { margin-top:12px }
</style>
