// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** getPointsInfo GET /api/points/info */
export async function getPointsInfoUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPointsInfoUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/api/points/info', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** getPointsInfoList POST /api/points/list/page/vo */
export async function getPointsInfoListUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPointsInfoListUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/api/points/list/page/vo', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** getUserPointsLogs GET /api/points/logs */
export async function getUserPointsLogsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserPointsLogsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/api/points/logs', {
    method: 'GET',
    params: {
      // pageNum has a default value: 1
      pageNum: '1',
      // pageSize has a default value: 10
      pageSize: '5',
      ...params,
    },
    ...(options || {}),
  })
}
