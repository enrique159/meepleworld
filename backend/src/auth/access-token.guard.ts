import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { jwtVerify } from 'jose'
import { IsNull } from 'typeorm'
import { readAppConfig } from '../config/app-config.js'
import { DatabaseService } from '../database/database.service.js'
import { UserSessionEntity } from '../database/entities/session.entity.js'
import { UserEntity, UserStatus } from '../database/entities/user.entity.js'
import type { AuthenticatedRequest } from '../common/request-context.js'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly secret = new TextEncoder().encode(readAppConfig().jwtAccessSecret)

  constructor(private readonly database: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const authorization = request.header('authorization')
    const match = authorization?.match(/^Bearer\s+(.+)$/i)
    if (!match) throw new UnauthorizedException()

    let subject: unknown
    let sessionId: unknown
    try {
      const verified = await jwtVerify(match[1], this.secret, { algorithms: ['HS256'] })
      subject = verified.payload.sub
      sessionId = verified.payload.sid
    } catch {
      throw new UnauthorizedException()
    }
    if (typeof subject !== 'string' || typeof sessionId !== 'string') throw new UnauthorizedException()

    const now = new Date()
    const session = await this.database.dataSource.getRepository(UserSessionEntity).findOne({
      where: { id: sessionId, userId: subject, revokedAt: IsNull() },
      select: { id: true, userId: true, expiresAt: true, revokedAt: true },
    })
    if (!session || session.expiresAt <= now) throw new UnauthorizedException()

    const user = await this.database.dataSource.getRepository(UserEntity).findOne({
      where: { id: subject },
      select: { id: true, username: true, displayName: true, email: true, avatarUrl: true, city: true, emailVerifiedAt: true, status: true, role: true },
    })
    if (!user) throw new UnauthorizedException()
    if (user.status !== UserStatus.ACTIVE) throw new ForbiddenException('La cuenta no está activa.')

    request.authenticatedUser = user
    request.sessionId = session.id
    return true
  }
}

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    if (!request.authenticatedUser?.emailVerifiedAt) throw new ForbiddenException('Verifica tu correo antes de realizar esta acción.')
    return true
  }
}
