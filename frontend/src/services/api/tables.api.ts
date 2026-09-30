import { apiRequest } from './httpClient'
import type { ApiPage, CreateTableInput, PrivateTableLocation, TableParticipation, TableSummary } from './api.types'

export function listTables(query: {
  city?: string; q?: string; gameId?: string; startsAfter?: string; startsBefore?: string; availableOnly?: boolean; page?: number; pageSize?: number
} = {}) {
  return apiRequest<ApiPage<TableSummary>>(`tables${toQuery(query)}`)
}

export function getTable(tableId: string) {
  return apiRequest<TableSummary>(`tables/${encodeURIComponent(tableId)}`)
}

export function getPrivateTableLocation(tableId: string, accessToken: string) {
  return apiRequest<PrivateTableLocation>(`tables/${encodeURIComponent(tableId)}/location`, { accessToken })
}

export function createTable(input: CreateTableInput, accessToken: string) {
  return apiRequest<TableSummary>('tables', { method: 'POST', accessToken, body: JSON.stringify(input) })
}

export function updateTable(tableId: string, input: Partial<CreateTableInput>, accessToken: string) {
  return apiRequest<TableSummary>(`tables/${encodeURIComponent(tableId)}`, { method: 'PATCH', accessToken, body: JSON.stringify(input) })
}

export function cancelTable(tableId: string, accessToken: string) {
  return apiRequest<{ status: 'cancelled' }>(`tables/${encodeURIComponent(tableId)}/cancel`, { method: 'POST', accessToken })
}

export function requestParticipation(tableId: string, requestedSeats: number, accessToken: string) {
  return apiRequest<TableParticipation>(`tables/${encodeURIComponent(tableId)}/participations`, {
    method: 'POST', accessToken, body: JSON.stringify({ requestedSeats }),
  })
}

export function listParticipations(tableId: string, accessToken: string) {
  return apiRequest<{ items: TableParticipation[] }>(`tables/${encodeURIComponent(tableId)}/participations`, { accessToken })
}

export function offerParticipation(tableId: string, participationId: string, seats: number, accessToken: string) {
  return apiRequest<TableParticipation>(`tables/${encodeURIComponent(tableId)}/participations/${encodeURIComponent(participationId)}/offer`, {
    method: 'POST', accessToken, body: JSON.stringify({ seats }),
  })
}

export function acceptParticipationOffer(tableId: string, participationId: string, accessToken: string) {
  return apiRequest<TableParticipation>(`tables/${encodeURIComponent(tableId)}/participations/${encodeURIComponent(participationId)}/accept`, { method: 'POST', accessToken })
}

export function rejectParticipation(tableId: string, participationId: string, accessToken: string) {
  return apiRequest<TableParticipation>(`tables/${encodeURIComponent(tableId)}/participations/${encodeURIComponent(participationId)}/reject`, { method: 'POST', accessToken })
}

export function cancelParticipation(tableId: string, participationId: string, accessToken: string) {
  return apiRequest<void>(`tables/${encodeURIComponent(tableId)}/participations/${encodeURIComponent(participationId)}`, { method: 'DELETE', accessToken })
}

function toQuery(values: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}
