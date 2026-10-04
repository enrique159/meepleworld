import { QueryFailedError } from 'typeorm'

export function isDuplicateKeyError(error: unknown, key: string): boolean {
  if (!(error instanceof QueryFailedError)) return false
  const driverError = error.driverError as { code?: string; sqlMessage?: string; message?: string }
  return driverError.code === 'ER_DUP_ENTRY' && (driverError.sqlMessage ?? driverError.message ?? '').includes(key)
}
