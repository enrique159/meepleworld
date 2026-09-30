import { apiRequest } from './httpClient'
import type { AuthUser, PublicProfile } from './api.types'

interface SessionResponse {
  accessToken: string
  user: AuthUser
}

export function register(input: { displayName: string; email: string; password: string }) {
  return apiRequest<{ userId: string; email: string; emailVerified: false; verificationEmailQueued: true }>('auth/register', {
    method: 'POST', body: JSON.stringify(input),
  })
}

export function login(input: { email: string; password: string }) {
  return apiRequest<SessionResponse>('auth/login', { method: 'POST', body: JSON.stringify(input) })
}

export function refreshSession() {
  return apiRequest<SessionResponse>('auth/refresh', { method: 'POST' })
}

export function logout(accessToken: string) {
  return apiRequest<void>('auth/logout', { method: 'POST', accessToken })
}

export function verifyEmail(token: string) {
  return apiRequest<{ emailVerified: true }>('auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) })
}

export function resendVerification(email: string) {
  return apiRequest<{ accepted: true }>('auth/verification/resend', { method: 'POST', body: JSON.stringify({ email }) })
}

export function requestPasswordReset(email: string) {
  return apiRequest<{ accepted: true }>('auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) })
}

export function resetPassword(token: string, newPassword: string) {
  return apiRequest<{ passwordChanged: true }>('auth/password/reset', { method: 'POST', body: JSON.stringify({ token, newPassword }) })
}

export function getCurrentUser(accessToken: string) {
  return apiRequest<AuthUser>('auth/me', { accessToken })
}

export function getMyProfile(accessToken: string) {
  return apiRequest<AuthUser>('users/me', { accessToken })
}

export function updateMyProfile(accessToken: string, input: { displayName?: string; city?: string | null; avatarUrl?: string | null }) {
  return apiRequest<AuthUser>('users/me', { method: 'PATCH', accessToken, body: JSON.stringify(input) })
}

export function getPublicProfile(userId: string) {
  return apiRequest<PublicProfile>(`users/${encodeURIComponent(userId)}`)
}
