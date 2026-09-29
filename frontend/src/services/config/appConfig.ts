const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const appConfig = {
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
  socketUrl: import.meta.env.VITE_WS_URL || window.location.origin,
  mapboxPublicToken: import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '',
} as const
