import router from '@/router'

/**
 * 跳转到用户详情页，并记录来源
 */
export const navigateToUserDetail = (user: any, replace = true) => {
  if (!user) return

  // 记录来源路由（覆盖即可，只需要最近一次来源）
  sessionStorage.setItem('fromPath', router.currentRoute.value.fullPath)

  const target = {
    path: `/user/${user.id}`,
    query: {
      userName: user.userName,
      userAvatar: user.userAvatar,
      userAccount: user.userAccount,
      userProfile: user.userProfile,
      userRole: user.userRole,
      createTime: user.createTime
    }
  }

  // 根据需要选择 push 或 replace
  if (replace) {
    console.log('使用 replace 跳转至:', target)
    router.replace(target)
  } else {
    router.push(target)
  }
}


