import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/current-user.decorator.js'
import { UserEntity } from '../database/entities/user.entity.js'
import { AccessTokenGuard } from '../auth/access-token.guard.js'
import { UpdateProfileDto } from './users.dto.js'
import { UsersService } from './users.service.js'

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@CurrentUser() user: UserEntity) {
    return this.users.getPrivateProfile(user)
  }

  @Patch('me')
  @UseGuards(AccessTokenGuard)
  updateMe(@CurrentUser() user: UserEntity, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user, dto)
  }

  @Get(':id')
  publicProfile(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.users.getPublicProfile(id)
  }
}
