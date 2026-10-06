import { Body, Controller, Get, Header, HttpCode, Post, Req, UseGuards } from '@nestjs/common'
import { readAppConfig } from '../config/app-config.js'
import { CurrentUser } from '../common/current-user.decorator.js'
import type { AuthenticatedRequest } from '../common/request-context.js'
import type { UserEntity } from '../database/entities/user.entity.js'
import { AccessTokenGuard } from './access-token.guard.js'
import { AuthRateLimit, AuthRateLimitGuard } from './auth-rate-limit.guard.js'
import { AuthService, type SessionTokens } from './auth.service.js'
import { ForgotPasswordDto, LoginDto, OneTimeTokenDto, RefreshTokenDto, RegisterDto, ResetPasswordDto } from './auth.dto.js'

@Controller('auth')
export class AuthController {
  private readonly config = readAppConfig()

  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(201)
  @AuthRateLimit('register')
  @UseGuards(AuthRateLimitGuard)
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto)
  }

  @Post('login')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  @AuthRateLimit('login')
  @UseGuards(AuthRateLimitGuard)
  async login(@Body() dto: LoginDto) {
    return this.toSessionResponse(await this.auth.login(dto))
  }

  @Post('refresh')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  @AuthRateLimit('login')
  @UseGuards(AuthRateLimitGuard)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.toSessionResponse(await this.auth.refresh(dto.refreshToken))
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(AccessTokenGuard)
  async logout(@Req() request: AuthenticatedRequest): Promise<void> {
    const sessionId = request.sessionId
    if (sessionId) await this.auth.revokeSession(sessionId)
  }

  @Post('verify-email')
  @HttpCode(200)
  @AuthRateLimit('verification')
  @UseGuards(AuthRateLimitGuard)
  verifyEmail(@Body() dto: OneTimeTokenDto) {
    return this.auth.verifyEmail(dto.token)
  }

  @Post('verification/resend')
  @HttpCode(202)
  @AuthRateLimit('verification')
  @UseGuards(AuthRateLimitGuard)
  resendVerification(@Body() dto: ForgotPasswordDto) {
    return this.auth.resendVerification(dto.email)
  }

  @Post('password/forgot')
  @HttpCode(202)
  @AuthRateLimit('recovery')
  @UseGuards(AuthRateLimitGuard)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.requestPasswordReset(dto.email)
  }

  @Post('password/reset')
  @HttpCode(200)
  @AuthRateLimit('recovery')
  @UseGuards(AuthRateLimitGuard)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto)
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@CurrentUser() user: UserEntity) {
    return this.auth.toAuthUser(user)
  }

  private toSessionResponse(session: SessionTokens) {
    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: this.config.accessTokenTtlSeconds,
      refreshExpiresIn: session.refreshTtlSeconds,
      user: session.user,
    }
  }
}
