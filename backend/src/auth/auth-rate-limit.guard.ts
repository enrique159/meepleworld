import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { AuthenticatedRequest } from '../common/request-context.js'

const AUTH_RATE_LIMIT = Symbol('AUTH_RATE_LIMIT')
const POLICIES: Record<string, { limit: number; windowMs: number }> = {
  register: { limit: 4, windowMs: 60 * 60_000 },
  login: { limit: 10, windowMs: 15 * 60_000 },
  verification: { limit: 8, windowMs: 60 * 60_000 },
  recovery: { limit: 5, windowMs: 60 * 60_000 },
}

export const AuthRateLimit = (policy: keyof typeof POLICIES) => SetMetadata(AUTH_RATE_LIMIT, policy)

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>()

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const policyName = this.reflector.getAllAndOverride<keyof typeof POLICIES>(AUTH_RATE_LIMIT, [context.getHandler(), context.getClass()])
    if (!policyName) return true
    const policy = POLICIES[policyName]
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const address = request.ip || request.socket.remoteAddress || 'unknown'
    const key = `${policyName}:${address}`
    const now = Date.now()
    const current = this.buckets.get(key)
    if (!current || current.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + policy.windowMs })
      return true
    }
    if (current.count >= policy.limit) {
      throw new HttpException({ code: 'RATE_LIMITED', message: 'Se alcanzó el límite temporal de solicitudes. Intenta más tarde.' }, HttpStatus.TOO_MANY_REQUESTS)
    }
    current.count += 1
    if (this.buckets.size > 5000) {
      for (const [bucketKey, bucket] of this.buckets) if (bucket.resetAt <= now) this.buckets.delete(bucketKey)
    }
    return true
  }
}
