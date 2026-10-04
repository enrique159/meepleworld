import { randomInt } from 'node:crypto'

export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 32
export const USERNAME_PATTERN = /^[a-z0-9_]+$/
export const USERNAME_GENERATION_ATTEMPTS = 5

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

export function generateUsername(): string {
  return `user${Date.now()}${randomInt(0, 100_000).toString().padStart(5, '0')}`
}
