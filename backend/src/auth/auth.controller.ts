import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { parse, serialize } from 'cookie'
import type { Request, Response } from 'express'
import { readAppConfig } from '../config/app-config.js'
import { CurrentUser } from '../common/current-user.decorator.js'
import type { AuthenticatedRequest } from '../common/request-context.js'
import type { UserEntity } from '../database/entities/user.entity.js'
import { AccessTokenGuard } from './access-token.guard.js'
import { AuthRateLimit, AuthRateLimitGuard } from './auth-rate-limit.guard.js'
import { AuthService } from './auth.service.js'
import { ForgotPasswordDto, LoginDto, OneTimeTokenDto, RegisterDto, ResetPasswordDto } from './auth.dto.js'

const REFRESH_COOKIE = 'meepleworld_refresh'
const REFRESH_COOKIE_PATH = '/api/v1/auth'

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
  @HttpCode(200)
  @AuthRateLimit('login')
  @UseGuards(AuthRateLimitGuard)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const session = await this.auth.login(dto)
    this.setRefreshCookie(response, session.refreshToken, session.refreshTtlSeconds)
    return { accessToken: session.accessToken, user: session.user }
  }

  @Post('refresh')
  @HttpCode(200)
  @AuthRateLimit('login')
  @UseGuards(AuthRateLimitGuard)
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = this.readRefreshCookie(request)
    const session = await this.auth.refresh(refreshToken)
    this.setRefreshCookie(response, session.refreshToken, session.refreshTtlSeconds)
    return { accessToken: session.accessToken, user: session.user }
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(AccessTokenGuard)
  async logout(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response): Promise<void> {
    const sessionId = request.sessionId
    if (sessionId) await this.auth.revokeSession(sessionId)
    this.clearRefreshCookie(response)
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

  private readRefreshCookie(request: Request): string {
    const rawCookie = request.headers.cookie ?? ''
    const token = parse(rawCookie)[REFRESH_COOKIE]
    if (!token) throw new UnauthorizedException()
    return token
  }

  private setRefreshCookie(response: Response, token: string, maxAge: number): void {
    response.setHeader('Set-Cookie', serialize(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.config.authCookieSecure,
      sameSite: this.config.authCookieSameSite,
      path: REFRESH_COOKIE_PATH,
      maxAge,
    }))
  }

  private clearRefreshCookie(response: Response): void {
    response.setHeader('Set-Cookie', serialize(REFRESH_COOKIE, '', {
      httpOnly: true,
      secure: this.config.authCookieSecure,
      sameSite: this.config.authCookieSameSite,
      path: REFRESH_COOKIE_PATH,
      expires: new Date(0),
    }))
  }
}
