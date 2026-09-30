import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { AccessTokenGuard, VerifiedEmailGuard } from './access-token.guard.js'
import { MailboxService } from './mailbox.service.js'
import { AuthRateLimitGuard } from './auth-rate-limit.guard.js'

@Module({
  controllers: [AuthController],
  providers: [AuthService, AccessTokenGuard, VerifiedEmailGuard, MailboxService, AuthRateLimitGuard],
  exports: [AccessTokenGuard, VerifiedEmailGuard],
})
export class AuthModule {}
