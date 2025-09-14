<template>
  <div id="globalSider">
    <div class="sider-wrapper" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
      <a-layout-sider
        v-if="loginUserStore.loginUser.id"
        :width="expanded ? 200 : 80"
        breakpoint="lg"
        collapsed-width="80"
        :trigger="null"
        collapsible
        :collapsed="!expanded"
        class="custom-sider"
      >
        <a-menu
          v-model:selectedKeys="current"
          mode="inline"
          :items="menuItems"
          @click="doMenuClick"
          class="custom-menu"
        />
      </a-layout-sider>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { h, ref, computed, watch,watchEffect, onMounted } from 'vue'
import {
  PictureOutlined,
  UserOutlined,
  CloudUploadOutlined,
  TeamOutlined,
  PlusOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { message } from 'ant-design-vue'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'

const loginUserStore = useLoginUserStore()
const router = useRouter()
const expanded = ref(false)
const isTeamExpanded = ref(false)
const userId = computed(() => loginUserStore.loginUser.id)

// 处理鼠标进入
const handleMouseEnter = () => {
  expanded.value = true
}

// 处理鼠标离开
const handleMouseLeave = () => {
  expanded.value = false
}

// 固定的菜单列表
const fixedMenuItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined, { style: 'font-size: 20px; color: #ff8e53;' }),
    label: '公共图库',
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined, { style: 'font-size: 20px; color: #36cfc9;' }),
  },
  {
    key: '/my_ports',
    label: '我的发布',
    icon: () => h(CloudUploadOutlined, { style: 'font-size: 20px; color: #73d13d;' }),
  },
]

const teamSpaceList = ref<API.SpaceUserVO[]>([])

// 显示添加团队按钮
const showAddTeamBtn = ref(false)

// 处理添加团队点击
const handleAddTeam = (e: Event) => {
  e.stopPropagation()
  router.push('/add_space?type=' + SPACE_TYPE_ENUM.TEAM)
}

// 计算菜单项
const menuItems = computed(() => {
  const items = [...fixedMenuItems]

  // 团队空间菜单
  const teamMenuItem = {
    key: 'team-spaces',
    icon: () => h(TeamOutlined, { style: 'font-size: 20px; color: #4f46e5;' }),
    label: '我的团队',
    children: [] as any[],
  }

  // 添加团队按钮，放在子菜单顶部
  teamMenuItem.children.push({
    key: 'add-team',
    label: h(
      'span',
      {
        class: 'add-team-btn',
        onClick: handleAddTeam,
        style: 'display:flex;align-items:center;gap:4px;cursor:pointer;',
      },
      [h(PlusOutlined), '添加团队']
    ),
  })

  // 如果有团队列表数据
  if (teamSpaceList.value.length > 0) {
    const displayCount = 3 // 默认显示前3个团队
    teamSpaceList.value.forEach((team, index) => {
      if (!isTeamExpanded.value && index >= displayCount) {
        return
      }
      // 判断是否是用户创建的团队
      const isCreator = team.space?.userId === userId.value
      const teamLabel = isCreator ? `${team.space?.spaceName} (我的)` : team.space?.spaceName
      teamMenuItem.children.push({
        key: `/space/${team.spaceId}`,
        label: teamLabel,
      })
    })
    // 添加展开/收起按钮
    if (teamSpaceList.value.length > displayCount && !isTeamExpanded.value) {
      teamMenuItem.children.push({
        key: 'expand',
        label: h(
          'div',
          { class: 'expand-collapse-text' },
          `展开其他 ${teamSpaceList.value.length - displayCount} 个团队`,
        ),
        onClick: (e: Event) => {
          e.stopPropagation()
          isTeamExpanded.value = true
        },
      })
    } else if (isTeamExpanded.value) {
      teamMenuItem.children.push({
        key: 'collapse',
        label: h('div', { class: 'expand-collapse-text' }, '收起'),
        onClick: (e: Event) => {
          e.stopPropagation()
          isTeamExpanded.value = false
        },
      })
    }
  }

  items.push(teamMenuItem)
  return items
})

const fetchTeamSpaces = async () => {
  try {
    const res = await listMyTeamSpaceUsingPost({})
    if (res.data.code === 0) {
      teamSpaceList.value = res.data.data ?? []
    }
  } catch (error) {
    console.error('获取团队空间列表失败:', error)
  }
}

// 挂载时获取一次
onMounted(fetchTeamSpaces)

// 新增：监听登录用户 id 变化，自动刷新团队列表
watch(
  () => loginUserStore.loginUser.id,
  (newId) => {
    if (newId) {
      fetchTeamSpaces()
    }
  }
)

// 当前要高亮的菜单项
const current = ref<string[]>([])

// 监听路由变化，更新高亮菜单项
router.afterEach((to) => {
  current.value = [to.path]
})

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  // 忽略展开/收起的点击
  if (key === 'expand' || key === 'collapse') {
    return
  }
  router.push(key)
}
</script>

<style scoped>
#globalSider {
  .sider-wrapper {
    position: relative;
    height: 100%;
    display: flex;
  }

  .custom-sider {
    margin-right: 16px;
    background: white;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
    overflow: hidden;
    box-shadow: 1px 0 0 0 rgba(0, 0, 0, 0.05);
    height: 100%;
  }

  :deep(.ant-menu) {
    border: none;
    transition: all 0.3s;
    height: 100%;
    padding-top: 8px;
  }

  :deep(.ant-menu-item),
  :deep(.ant-menu-submenu-title) {
    height: 48px;
    line-height: 48px;
    border-radius: 12px;
    margin: 4px 8px;
    color: #64748b;
    padding: 0 16px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    font-size: 16px;
  }

  :deep(.ant-menu-item .anticon),
  :deep(.ant-menu-submenu-title .anticon) {
    transition: all 0.3s ease;
    margin-right: 10px;
    font-size: 20px !important;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.ant-menu-item:hover),
  :deep(.ant-menu-submenu-title:hover) {
    color: #ff8e53;
    background: #fff6f3;
  }
  :deep(.ant-menu-item-selected),
  :deep(.ant-menu-submenu-selected) {
    color: #ff8e53;
    background: #fff6f3;
    font-weight: 500;
  }
  :deep(.ant-menu-item-selected .anticon),
  :deep(.ant-menu-submenu-selected .anticon),
  :deep(.ant-menu-item:hover .anticon),
  :deep(.ant-menu-submenu-title:hover .anticon) {
    color: #ff8e53 !important;
    transform: scale(1.1);
  }

  /* 折叠状态下的样式 */
  :deep(.ant-menu-inline-collapsed) {
    width: 80px;
    .ant-menu-item, .ant-menu-submenu-title {
      padding: 0 28px !important;
      .anticon {
        margin-right: 0;
        font-size: 20px;
      }
    }
  }

  :deep(.ant-layout-sider-children) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* 响应式调整 */
  @media screen and (max-width: 992px) {
    .custom-sider {
      margin-right: 0;
    }
    :deep(.ant-menu-item),
    :deep(.ant-menu-submenu-title) {
      height: 42px;
      line-height: 42px;
      margin: 2px 4px;
    }
  }
}

.add-team-btn {
  font-size: 16px;
  padding: 4px 8px;
  color: #4f46e5;
  opacity: 0.8;
  transition: all 0.3s ease;
  margin-left: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 4px;
}
.add-team-btn:hover {
  opacity: 1;
  background: #f5f3ff;
  color: #4f46e5;
  transform: scale(1.08);
}

:deep(.team-menu-item) {
  .ant-menu-submenu-title {
    padding-left: 31px;
  }

  /* 没有团队时隐藏箭头 */
  &:not(.ant-menu-submenu-open):not(:hover) .ant-menu-submenu-arrow {
    display: none;
  }
}

/* 确保图标大小一致 */
:deep(.anticon) {
  font-size: 20px !important;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-collapse-text {
  font-size: 13px;
  color: #6b7280;

  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.expand-collapse-text:hover {
  color: #4f46e5;
  background: #f5f3ff;
}
</style>
