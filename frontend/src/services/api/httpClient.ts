import { appConfig } from '@/services/config/appConfig'
import type { AuthUser } from './api.types'

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
  return request<T>(path, options, true)
}

interface RefreshedSession {
  accessToken: string
  user: AuthUser
}

let refreshInFlight: Promise<RefreshedSession | null> | null = null
let onSessionRefreshed: ((session: RefreshedSession) => void) | undefined
let onSessionRefreshFailed: (() => void) | undefined

export function setSessionRefreshHandlers(
  onSuccess: (session: RefreshedSession) => void,
  onFailure: () => void,
) {
  onSessionRefreshed = onSuccess
  onSessionRefreshFailed = onFailure
}

async function request<T>(path: string, options: ApiRequestOptions, mayRefresh: boolean): Promise<T> {
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

  if (response.status === 401 && accessToken && mayRefresh) {
    const renewed = await refreshAccessToken()
    if (renewed) return request<T>(path, { ...options, accessToken: renewed.accessToken }, false)
  }

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null)
    const errorPayload = isRecord(payload) ? payload : {}
    throw new ApiError(
      typeof errorPayload.message === 'string' ? errorPayload.message : 'No se pudo completar la solicitud.',
      response.status,
      typeof errorPayload.code === 'string' ? errorPayload.code : undefined,
      (typeof errorPayload.requestId === 'string' ? errorPayload.requestId : response.headers.get('x-request-id')) ?? undefined,
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

async function refreshAccessToken(): Promise<RefreshedSession | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(appConfig.apiBaseUrl + '/auth/refresh', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) return null
        const payload: unknown = await response.json()
        if (!isRecord(payload) || typeof payload.accessToken !== 'string' || !isAuthUser(payload.user)) return null
        return { accessToken: payload.accessToken, user: payload.user }
      } catch {
        return null
      }
    })().finally(() => {
      refreshInFlight = null
    })
  }

  const session = await refreshInFlight
  if (session) onSessionRefreshed?.(session)
  else onSessionRefreshFailed?.()
  return session
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isAuthUser(value: unknown): value is AuthUser {
  return isRecord(value) && typeof value.id === 'string' && typeof value.displayName === 'string' &&
    typeof value.email === 'string' && typeof value.emailVerified === 'boolean'
}
