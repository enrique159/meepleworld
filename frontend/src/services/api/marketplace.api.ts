import { apiRequest } from './httpClient'
import type { ApiPage, CreateListingInput, ListingKind, ListingStatus, MarketplaceListing } from './api.types'

export function listListings(query: { kind?: ListingKind; city?: string; q?: string; gameId?: string; page?: number; pageSize?: number } = {}) {
  return apiRequest<ApiPage<MarketplaceListing>>(`marketplace/listings${toQuery(query)}`)
}

export function getListing(listingId: string) {
  return apiRequest<MarketplaceListing>(`marketplace/listings/${encodeURIComponent(listingId)}`)
}

export function createListing(input: CreateListingInput, accessToken: string) {
  return apiRequest<MarketplaceListing>('marketplace/listings', { method: 'POST', accessToken, body: JSON.stringify(input) })
}

export function updateListing(listingId: string, input: Partial<Omit<CreateListingInput, 'kind' | 'gameId'>>, accessToken: string) {
  return apiRequest<MarketplaceListing>(`marketplace/listings/${encodeURIComponent(listingId)}`, { method: 'PATCH', accessToken, body: JSON.stringify(input) })
}

export function closeListing(listingId: string, outcome: ListingStatus, accessToken: string) {
  return apiRequest<{ id: string; status: ListingStatus }>(`marketplace/listings/${encodeURIComponent(listingId)}/close`, {
    method: 'POST', accessToken, body: JSON.stringify({ outcome }),
  })
}

function toQuery(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}
