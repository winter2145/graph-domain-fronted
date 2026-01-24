<template>
  
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { listCategoryByTypeUsingGet } from '@/api/categoryController'
import PostList from '@/components/PostList.vue'
import { POST_STATUS_ENUM } from '@/constants/post'
import { message } from 'ant-design-vue'
import { getDeviceType } from '@/utils/device'
import { DEVICE_TYPE_ENUM } from '@/constants/device'
import { throttle } from 'lodash-es'

const router = useRouter()
const activeTab = ref('all')



// 添加 PC 端标签切换处理函数
const handleTabChange = (key: string) => {
  activeTab.value = key
}
</script>

<style scoped>
#forumPage {
  min-height: 100vh;
  padding: 0;
  margin-left: -24px;
  margin-right: -24px;
  overflow-x: hidden;
  background: #ffffff;
}

/* 固定顶部导航区域 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  display: flex;
  align-items: center;
  height: 44px;
  border-bottom: 1px solid #f0f0f0;
}

/* 移动端导航包装器 */
.mobile-nav-wrapper {
  flex: 1;
  width: calc(100% - 60px);
}

/* 移动端导航样式 */
.mobile-nav-wrapper :deep(.van-tabs__wrap) {
  height: 48px;
  padding: 8px 16px 0;
}

.mobile-nav-wrapper :deep(.van-tabs__nav) {
  background: transparent;
  border-radius: 20px;
  padding: 4px;
  display: flex;
  justify-content: flex-start;
  height: 40px;
}

.mobile-nav-wrapper :deep(.van-tab) {
  padding: 0;
  margin: 0 8px;
  font-size: 15px;
  font-weight: 400;
  color: #64748b;
  flex: none;
  min-width: 72px !important;
  height: 32px;
  line-height: 32px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;

  &:hover {
    color: #1890ff;
    background: rgba(24, 144, 255, 0.05);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: currentColor;
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:active::after {
    opacity: 0.1;
  }
}

.mobile-nav-wrapper :deep(.van-tab--active) {
  color: #1890ff;
  font-weight: 500;
  font-size: 15px;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(54, 207, 201, 0.15));
  box-shadow:
    0 2px 8px rgba(24, 144, 255, 0.1),
    0 1px 4px rgba(24, 144, 255, 0.05);
  border-radius: 16px;
  transform: translateY(-1px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-nav-wrapper :deep(.van-tabs__line) {
  display: none;
}

/* 分类导航样式 */
.category-nav {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  height: 36px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 12px 1px;
  overflow-x: auto;
  border-bottom: 1px solid #f0f0f0;
  z-index: 99;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.category-item {
  padding: 2px 12px;
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 16px;
  background: rgba(24, 144, 255, 0.05);

  &:hover {
    color: #1890ff;
    background: rgba(24, 144, 255, 0.08);
  }
}

.category-item.active {
  color: #1890ff;
  font-weight: 500;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.12), rgba(54, 207, 201, 0.15));
  box-shadow:
    0 2px 8px rgba(24, 144, 255, 0.1),
    0 1px 4px rgba(24, 144, 255, 0.05);
}


/* 分类导航样式 */
.pc-category-nav {
  height: 36px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 12px 1px;
  overflow-x: auto;
  border-bottom: 1px solid #f0f0f0;
  z-index: 99;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.pc-category-item {
  padding: 2px 12px;
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 16px;
  background: rgba(24, 144, 255, 0.05);

  &:hover {
    color: #ff8e53;
    background: rgba(24, 144, 255, 0.08);
  }
}

.pc-category-item.active {
  color: #ff8e53;
  font-weight: 500;
  background: linear-gradient(135deg, rgba(199, 164, 129, 0.12), rgba(207, 131, 54, 0.15));
  box-shadow:
    0 2px 8px rgba(192, 153, 100, 0.1),
    0 1px 4px rgba(24, 144, 255, 0.05);
}

/* 搜索框样式 */
.mobile-search {
  position: absolute;
  right: 12px;
  width: 80px;
  margin-top: 8px;
  height: 48px;
  display: flex;
  align-items: center;
  z-index: 2;
}

.search-button {
  border: none;
  background: rgba(24, 144, 255, 0.1);
  border-radius: 16px;
  width: 100%;
  height: 32px;
  transition: all 0.3s ease;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(24, 144, 255, 0.1), rgba(54, 207, 201, 0.2));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.12), rgba(54, 207, 201, 0.15));
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(24, 144, 255, 0.1);
  }
}

.search-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  position: relative;
  z-index: 1;
}

.search-icon {
  color: #1890ff;
  font-size: 16px;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.search-divider {
  color: rgba(24, 144, 255, 0.3);
  font-size: 14px;
  transform: scale(0.9);
  margin: 0 -1px;
}

.search-text {
  color: #1890ff;
  font-size: 13px;
  opacity: 0.8;
  transition: all 0.3s ease;
  font-weight: 500;
}

/* 列表容器样式 */
.post-list-wrapper {
  margin-left: -24px;
  margin-right: -24px;
  background: #fff;
  transition: margin-top 0.3s ease;
}

.empty-following {
  padding: 40px 20px;
  text-align: center;
}

.custom-empty {
  padding: 32px 0;
}

.empty-desc {
  margin: 8px 0 16px;
  color: #94a3b8;
  font-size: 14px;
}

.discover-btn {
  width: 120px;
  height: 36px;
  border-radius: 18px;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  border: none;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
  transition: all 0.3s ease;
}

.discover-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.3);
}

.discover-btn:active {
  transform: translateY(1px);
}

.post-item {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
}

.post-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;

  .post-category {
    font-size: 12px;
    color: #666;
    background: #f5f5f5;
    padding: 2px 8px;
    border-radius: 4px;
  }
}

.post-info {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #666;
  margin-bottom: 8px;

  .post-stats {
    display: flex;
    gap: 16px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;

      &:hover {
        color: #1890ff;
      }
    }
  }

  .liked {
    color: #36cfc9;
  }
}

.post-attachments {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  overflow-x: auto;

  .attachment-preview {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
    }
  }
}

/* 搜索框过渡动画 */
.mobile-search-transitioning {
  transform: scale(1.1) translateY(-10px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-nav {
  flex: 1;
  background: #fff;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  color: #999;
  font-size: 14px;
  gap: 8px;
}

.no-more-data {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 14px;
  opacity: 0.8;
}

.mobile-list-container {
  padding: 0 12px 12px;
  background: #fff;
}

/* 修改下拉刷新样式 */
:deep(.van-pull-refresh) {
  min-height: 100vh;
  background: #fff;
  overflow: visible;
}

:deep(.van-pull-refresh__track) {
  min-height: 100vh;
  background: #fff;
}

/* PC端样式 */
.pc-container {
  background: #f8fafc;
  margin: 0;
  width: 100%;

  .pc-content-wrapper {
    margin: 0 auto;
  }

  .pc-nav {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    margin-bottom: 16px;

    :deep(.ant-tabs-nav) {
      margin: 0;
      padding: 0 24px;
    }

    :deep(.ant-tabs-tab) {
      padding: 0 24px 6px;
      font-size: 16px;
      transition: all 0.3s;
      margin: 0;

      &:hover {
        color: #ff8e53;
      }

      &.ant-tabs-tab-active {
        .ant-tabs-tab-btn {
          color: #ff8e53;
          font-weight: 500;
        }
      }
    }

    :deep(.ant-tabs-ink-bar) {
      background: #ff8e53;
    }
  }

  .pc-category {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    margin-bottom: 16px;

    :deep(.ant-tabs-nav) {
      margin: 0;
      padding: 0 24px;
    }

    :deep(.ant-tabs-tab) {
      padding: 12px 20px;
      font-size: 14px;
      transition: all 0.3s;
      margin: 0;

      &:hover {
        color: #ff8e53;
      }

      &.ant-tabs-tab-active {
        .ant-tabs-tab-btn {
          color: #ff8e53;
          font-weight: 500;
        }
      }
    }

    :deep(.ant-tabs-ink-bar) {
      background: #ff8e53;
    }
  }

  .pc-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    padding: 24px;

    .post-list-container {
      margin: 0;
      padding: 0;
    }
  }

  .empty-following {
    padding: 60px 0;
    text-align: center;

    .empty-desc {
      color: #666;
      margin: 16px 0;
    }

    .ant-btn {
      min-width: 120px;
      height: 36px;
      border-radius: 18px;
      font-weight: 500;
      background: #ff8e53;
      border-color: #ff8e53;

      &:hover {
        background: #ff7a33;
        border-color: #ff7a33;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 142, 83, 0.2);
      }

      &:active {
        background: #ff6b1a;
        border-color: #ff6b1a;
        transform: translateY(0);
      }
    }
  }
}
</style>
