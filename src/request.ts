import axios from "axios";
import {message} from "ant-design-vue";
import { generateRedirectUrl } from '@/utils/redirectUtils'

// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: '',
  timeout: 60000,
  withCredentials: true,
});

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  },
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    const { data } = response
    // 未登录
    if (data.code === 40100) {
      // 如果应用正在首次获取登录用户信息（页面初始化时），不要立即跳转
      if ((window as any).__IS_FETCHING_LOGIN_USER__) {
        return response
      }
      // 部分接口（例如公开的评论查询）允许匿名查看，不应由全局拦截器强制跳转
      const requestUrl: string = response.request?.responseURL || ''
      const skipAutoRedirectPaths = [
        '/api/comments/query'
      ]
      const shouldSkip = skipAutoRedirectPaths.some((p) => requestUrl.includes(p))
      if (shouldSkip) {
        // 返回响应，让调用方处理 40100 的展示逻辑（避免强制跳转导致抽屉被关闭）
        return response
      }

      // 不是获取用户信息的请求，并且用户目前不是已经在用户登录页面，则跳转到登录页面
      if (
        !requestUrl.includes('user/get/login') &&
        !window.location.pathname.includes('/user/login')
      ) {
        message.warning('请先登录')
        window.location.href = generateRedirectUrl()
      }
    }

    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  },
)

export default myAxios;
