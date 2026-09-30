import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { AuthenticatedRequest } from './request-context.js'
import type { UserEntity } from '../database/entities/user.entity.js'

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): UserEntity => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
  if (!request.authenticatedUser) throw new Error('CurrentUser requiere AccessTokenGuard.')
  return request.authenticatedUser
})
