export function errorMessage(error: unknown, fallback = 'No se pudo completar la solicitud.') {
  return error instanceof Error ? error.message : fallback
}
