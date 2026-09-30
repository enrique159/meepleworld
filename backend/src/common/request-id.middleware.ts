import { randomUUID } from 'node:crypto'
import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from './request-context.js'

export function requestIdMiddleware(request: AuthenticatedRequest, response: Response, next: NextFunction): void {
  const requestId = randomUUID()
  request.requestId = requestId
  response.setHeader('X-Request-Id', requestId)
  next()
}
