import { appConfig } from '@/services/config/appConfig'

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | null
  accessToken?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly requestId?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { accessToken, ...requestOptions } = options
  const normalizedPath = path.replace(/^\//, '')
  const url = appConfig.apiBaseUrl + '/' + normalizedPath
  const headers = new Headers(requestOptions.headers)
  headers.set('Accept', 'application/json')
  if (requestOptions.body && !(requestOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) headers.set('Authorization', 'Bearer ' + accessToken)

  const response = await fetch(url, {
    ...requestOptions,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null)
    const errorPayload = isRecord(payload) ? payload : {}
    throw new ApiError(
      typeof errorPayload.message === 'string' ? errorPayload.message : 'No se pudo completar la solicitud.',
      response.status,
      typeof errorPayload.code === 'string' ? errorPayload.code : undefined,
      response.headers.get('x-request-id') ?? undefined,
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
