// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** getRules GET /api/exchange/rules */
export async function getRulesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRulesUsingGET1Params,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/api/exchange/rules', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** exchangeSpace POST /api/exchange/space */
export async function exchangeSpaceUsingPost(
  body: API.ExchangeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/api/exchange/space', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
