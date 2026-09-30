import { apiRequest } from './httpClient'
import type { ApiPage, GameSummary, LibraryEntry } from './api.types'

export function listGames(query: { q?: string; page?: number; pageSize?: number } = {}) {
  return apiRequest<ApiPage<GameSummary>>(`games${toQuery(query)}`)
}

export function getGame(gameId: string) {
  return apiRequest<GameSummary>(`games/${encodeURIComponent(gameId)}`)
}

export function createGame(input: { name: string; imageUrl?: string | null; minPlayers?: number | null; maxPlayers?: number | null; playingTimeMinutes?: number | null }, accessToken: string) {
  return apiRequest<GameSummary>('games', { method: 'POST', accessToken, body: JSON.stringify(input) })
}

export function getLibrary(accessToken: string) {
  return apiRequest<{ items: LibraryEntry[] }>('library', { accessToken })
}

export function addLibraryGame(gameId: string, accessToken: string) {
  return apiRequest<GameSummary>('library', { method: 'POST', accessToken, body: JSON.stringify({ gameId }) })
}

export function removeLibraryGame(gameId: string, accessToken: string) {
  return apiRequest<void>(`library/${encodeURIComponent(gameId)}`, { method: 'DELETE', accessToken })
}

function toQuery(values: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}
