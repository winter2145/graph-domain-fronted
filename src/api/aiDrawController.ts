// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /ai_draw/delete/${param0} */
export async function deleteSession(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteSessionParams,
  options?: { [key: string]: any }
) {
  const { sessionId: param0, ...queryParams } = params
  return request<API.BaseResponseBoolean_>(`/api/ai_draw/delete/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /ai_draw/session/${param0}/history_messages */
export async function getMessages(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMessagesParams,
  options?: { [key: string]: any }
) {
  const { sessionId: param0, ...queryParams } = params
  return request<API.BaseResponseListAiChatMessageVO>(
    `/api/ai_draw/session/${param0}/history_messages`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  )
}

/** 此处后端没有提供注释 POST /ai_draw/session/${param0}/history_messages */
export async function getMessagesByPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMessagesByPageParams,
  body: API.AiDrawQueryRequest,
  options?: { [key: string]: any }
) {
  const { sessionId: param0, ...queryParams } = params
  return request<API.BaseResponsePageAiChatMessageVO>(
    `/api/ai_draw/session/${param0}/history_messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  )
}


/** 此处后端没有提供注释 POST /ai_draw/session/${param0}/message */
export async function generateImage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.generateImageParams,
  body: API.GenerateImageRequest,
  options?: { [key: string]: any }
) {
  const { sessionId: param0, ...queryParams } = params
  return request<API.BaseResponseAiGenerateImageVO>(`/api/ai_draw/session/${param0}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /ai_draw/session/create */
export async function createSession(
  body: API.CreateSessionRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>('/api/ai_draw/session/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /ai_draw/sessions */
export async function getUserSessions(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserSessionsParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListAiChatSessionVO>('/api/ai_draw/sessions', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /ai_draw/session/${param0}/update_title */
export async function updateSessionTitle(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateSessionTitleParams,
  options?: { [key: string]: any }
) {
  const { sessionId: param0, ...queryParams } = params
  return request<API.BaseResponseString>(`/api/ai_draw/session/${param0}/update_title`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  })
}