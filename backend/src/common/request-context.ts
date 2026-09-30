import type { Request } from 'express'
import type { UserEntity } from '../database/entities/user.entity.js'

export interface AuthenticatedRequest extends Request {
  requestId?: string
  authenticatedUser?: UserEntity
  sessionId?: string
}
