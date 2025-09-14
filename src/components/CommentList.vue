<template>
  <div>
    <a-comment v-for="(comment, index) in comments" :key="index" style="margin-bottom: 5px">
      <template #actions>
        <span key="comment-basic-like">
          <a-tooltip>
            <template v-if="comment.likeStatus === 1">
              <LikeFilled @click="like(comment)" />
            </template>
            <template v-else>
              <LikeOutlined @click="like(comment)" />
            </template>
          </a-tooltip>
          <span style="padding-left: 8px; cursor: auto">
            {{ comment.likeCount }}
          </span>
        </span>
        <span key="comment-basic-dislike">
          <a-tooltip>
            <template v-if="comment.likeStatus === 2">
              <DislikeFilled @click="dislike(comment)" />
            </template>
            <template v-else>
              <DislikeOutlined @click="dislike(comment)" />
            </template>
          </a-tooltip>
          <span style="padding-left: 8px; cursor: auto">
            {{ comment.dislikeCount }}
          </span>
        </span>
        <span
          key="comment-basic-delete"
          style="font-size: 12px"
          v-if="comment.commentUser?.id === loginUserStore.loginUser?.id"
          @click="(e) => doDelete(comment, e)"
          ><DeleteOutlined
        /></span>
        <span
          key="comment-nested-reply-to"
          style="font-size: 12px"
          @click.stop="handleReplyClick(comment.commentId || '')"
        >
          回复
        </span>
        <span
          v-if="comment.children && comment.children.length > 0"
          :key="`expand-${comment.commentId}`"
          @click="toggleExpand(comment)"
          >{{ comment.isExpanded ? '折叠' : '展开' }}</span
        >
      </template>
      <template #author>
        <a>{{ comment.commentUser?.userName }}</a>
      </template>
      <template #avatar>
        <a-avatar :src="comment.commentUser?.userAvatar" alt="User" />
      </template>
      <template #content>
        <p>
          {{ comment.content }}
        </p>
      </template>
      <template #datetime>
        <a-tooltip>
          <span key="comment-nested-reply-to" style="font-size: 12px">{{
            formatTime(comment.createTime)
          }}</span>
        </a-tooltip>
      </template>
      <CommentList
        class="comment-list-wrapper"
        v-if="comment.children && comment.children.length > 0 && comment.isExpanded"
        :comments="comment.children"
        @reply-clicked="handleReplyClick"
        @close-comments="forwardClose"
      />
    </a-comment>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  LikeFilled,
  LikeOutlined,
  DislikeFilled,
  DislikeOutlined,
  DeleteOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'
import moment from 'moment'
import { deleteCommentUsingPost, likeCommentUsingPost } from '@/api/commentsController.ts'
import { doLikeUsingPost } from '@/api/likeRecordController.ts'
import { message, Modal } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const loginUserStore = useLoginUserStore()
const router = useRouter()

interface Comment {
  current?: number
  pageSize?: number
  sortField?: string
  sortOrder?: string
  commentId?: string
  pictureId?: number
  content?: string
  createTime?: string
  parentCommentId?: string
  likeCount?: string
  dislikeCount?: string
  likeStatus?: number // 0-未操作，1-点赞，2-点踩
  children?: Comment[]
  commentUser?: {
    id?: number
    userAccount?: string
    userAvatar?: string
    userName?: string
  }
  isExpanded?: boolean
}

const props = defineProps<{
  comments: Comment[]
}>()

const emit = defineEmits(['update-comments', 'reply-clicked', 'close-comments'])

// 将子组件的 close-comments 事件向上转发
const forwardClose = () => {
  emit('close-comments')
}

const likedComments = ref<string[]>([])
const dislikedComments = ref<string[]>([])

// 初始化点赞状态
const initializeLikeStatus = () => {
  props.comments.forEach(comment => {
    const commentId = comment.commentId || ''
    if (comment.likeStatus === 1) {
      likedComments.value.push(commentId)
    } else if (comment.likeStatus === 2) {
      dislikedComments.value.push(commentId)
    }
  })
}

// 监听comments变化，重新初始化状态
watch(() => props.comments, () => {
  likedComments.value = []
  dislikedComments.value = []
  initializeLikeStatus()
}, { immediate: true })

const formatTime = (time: string | undefined): string => {
  if (!time) return ''
  const commentTime = new Date(time)
  const now = new Date()
  const diff = now.getTime() - commentTime.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 12) {
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      if (minutes === 0) {
        return '刚刚'
      }
      return `${minutes} 分钟前`
    }
    return `${hours} 小时前`
  }
  return moment(commentTime).format('YYYY-MM-DD')
}

const like = async (comment: Comment) => {
  try {
    // 如果未登录，立即触发登录流程并阻止 UI 变更
    if (!loginUserStore.loginUser?.id) {
  // 告知上层（比如包含的抽屉或评论面板）关闭评论界面，避免 UI 残留
  emit('close-comments')
      // 使用路由跳转到登录页并携带当前页面作为重定向
      router.push(`/user/login?redirect=${window.location.href}`)
      return
    }
    const commentId = comment.commentId || ''
    if (!commentId) return

    const currentLikeStatus = comment.likeStatus || 0
    let newLikeStatus = 0

    // 如果已经点赞了，则取消点赞
    if (currentLikeStatus === 1) {
      newLikeStatus = 0
      likedComments.value = likedComments.value.filter((id) => id !== commentId)
    } else {
      // 如果还没点赞，则点赞
      newLikeStatus = 1
      likedComments.value.push(commentId)
      
      // 如果之前点踩了，取消点踩
      if (dislikedComments.value.includes(commentId)) {
        dislikedComments.value = dislikedComments.value.filter((id) => id !== commentId)
      }
    }

    // 构造 CommentsLikeRequest 请求体，互斥切换时两个字段都要传
    let likeCount = 0
    let dislikeCount = 0
    if (currentLikeStatus === 1 && newLikeStatus === 0) {
      // 取消点赞
      likeCount = -1
      dislikeCount = 0
    } else if (currentLikeStatus === 2 && newLikeStatus === 1) {
      // 点踩转点赞
      likeCount = 1
      dislikeCount = -1
    } else if (currentLikeStatus === 0 && newLikeStatus === 1) {
      // 普通点赞
      likeCount = 1
      dislikeCount = 0
    }
    const requestBody = {
      commentId: parseInt(commentId),
      userId: loginUserStore.loginUser?.id,
      likeCount,
      dislikeCount
    }
    await likeCommentUsingPost(requestBody)

    // 更新本地显示的数据
    comment.likeStatus = newLikeStatus
    
    // 更新点赞数量
    if (newLikeStatus === 1) {
      const currentLikeCount = parseInt(comment.likeCount || '0')
      comment.likeCount = (currentLikeCount + 1).toString()
      
      // 如果之前是点踩状态，减少点踩数量
      if (currentLikeStatus === 2) {
        const currentDislikeCount = parseInt(comment.dislikeCount || '0')
        comment.dislikeCount = Math.max(0, currentDislikeCount - 1).toString()
      }
    } else {
      // 取消点赞
      const currentLikeCount = parseInt(comment.likeCount || '0')
      comment.likeCount = Math.max(0, currentLikeCount - 1).toString()
    }
  } catch (error) {
    console.error('点赞操作失败', error)
    message.error('点赞操作失败，请稍后重试')
  }
}

const dislike = async (comment: Comment) => {
  try {
    // 如果未登录，立即触发登录流程并阻止 UI 变更
    if (!loginUserStore.loginUser?.id) {
  // 告知上层关闭评论界面
  emit('close-comments')
  router.push(`/user/login?redirect=${window.location.href}`)
      return
    }
    const commentId = comment.commentId || ''
    if (!commentId) return

    const currentLikeStatus = comment.likeStatus || 0
    let newLikeStatus = 0

    // 如果已经点踩了，则取消点踩
    if (currentLikeStatus === 2) {
      newLikeStatus = 0
      dislikedComments.value = dislikedComments.value.filter((id) => id !== commentId)
    } else {
      // 如果还没点踩，则点踩
      newLikeStatus = 2
      dislikedComments.value.push(commentId)
      
      // 如果之前点赞了，取消点赞
      if (likedComments.value.includes(commentId)) {
        likedComments.value = likedComments.value.filter((id) => id !== commentId)
      }
    }

    // 构造 CommentsLikeRequest 请求体，互斥切换时两个字段都要传
    let likeCount = 0
    let dislikeCount = 0
    if (currentLikeStatus === 2 && newLikeStatus === 0) {
      // 取消点踩
      likeCount = 0
      dislikeCount = -1
    } else if (currentLikeStatus === 1 && newLikeStatus === 2) {
      // 点赞转点踩
      likeCount = -1
      dislikeCount = 1
    } else if (currentLikeStatus === 0 && newLikeStatus === 2) {
      // 普通点踩
      likeCount = 0
      dislikeCount = 1
    }
    const requestBody = {
      commentId: parseInt(commentId),
      userId: loginUserStore.loginUser?.id,
      likeCount,
      dislikeCount
    }
    await likeCommentUsingPost(requestBody)

    // 更新本地显示的数据
    comment.likeStatus = newLikeStatus
    
    // 更新点踩数量
    if (newLikeStatus === 2) {
      const currentDislikeCount = parseInt(comment.dislikeCount || '0')
      comment.dislikeCount = (currentDislikeCount + 1).toString()
      
      // 如果之前是点赞状态，减少点赞数量
      if (currentLikeStatus === 1) {
        const currentLikeCount = parseInt(comment.likeCount || '0')
        comment.likeCount = Math.max(0, currentLikeCount - 1).toString()
      }
    } else {
      // 取消点踩
      const currentDislikeCount = parseInt(comment.dislikeCount || '0')
      comment.dislikeCount = Math.max(0, currentDislikeCount - 1).toString()
    }
  } catch (error) {
    console.error('点踩操作失败', error)
    message.error('点踩操作失败，请稍后重试')
  }
}

const doDelete = async (comment: Comment, e: Event) => {
  e.stopPropagation()
  const requestBody: API.CommentsDeleteRequest = {
    commentId: parseInt(comment.commentId || '0'),
  }
  try {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该评论吗？此操作不可撤销哦！',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const res = await deleteCommentUsingPost(requestBody)
        if (res.data) {
          emit('update-comments')
        } else {
          message.error('评论删除失败：服务器未返回成功信息')
        }
      },
      onCancel: () => {
        message.info('已取消删除操作')
      },
    })
  } catch (error) {
    console.error('删除评论操作失败', error)
    message.error('删除评论操作失败，请稍后重试')
  }
}

const toggleExpand = (comment: Comment) => {
  comment.isExpanded = !comment.isExpanded
}

const handleReplyClick = (commentId: string) => {
  // console.log('CommentList - 回复被点击，评论 ID:', commentId)
  emit('reply-clicked', commentId)
  // console.log('CommentList - 回复被点击，评论 ID:', commentId.toString())
}
</script>

<style scoped>
.ant-comment :deep(.ant-comment-inner) {
  padding: 1px 0;
}

.ant-comment :deep(.ant-comment-actions) {
  margin-top: 4px;
  margin-bottom: 8px;
}

:deep(.comment-list-wrapper) {
  padding-left: -100px !important;
}
</style>
