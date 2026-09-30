import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/current-user.decorator.js'
import { UserEntity } from '../database/entities/user.entity.js'
import { AccessTokenGuard, VerifiedEmailGuard } from '../auth/access-token.guard.js'
import { CreateParticipationDto, CreateTableDto, OfferParticipationDto, TableQueryDto, UpdateTableDto } from './tables.dto.js'
import { TablesService } from './tables.service.js'

@Controller('tables')
export class TablesController {
  constructor(private readonly tables: TablesService) {}

  @Get()
  list(@Query() query: TableQueryDto) { return this.tables.list(query) }

  @Get(':id')
  get(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) { return this.tables.get(id) }

  @Get(':id/location')
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  getPrivateLocation(@CurrentUser() user: UserEntity, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.tables.getPrivateLocation(id, user)
  }

  @Post()
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateTableDto) { return this.tables.create(user, dto) }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  update(@CurrentUser() user: UserEntity, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: UpdateTableDto) {
    return this.tables.update(id, user, dto)
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  cancel(@CurrentUser() user: UserEntity, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string) { return this.tables.cancel(id, user) }

  @Post(':id/participations')
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  requestParticipation(@CurrentUser() user: UserEntity, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: CreateParticipationDto) {
    return this.tables.requestParticipation(id, user, dto)
  }

  @Get(':id/participations')
  @UseGuards(AccessTokenGuard)
  listParticipations(@CurrentUser() user: UserEntity, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.tables.listParticipations(id, user)
  }

  @Post(':id/participations/:participationId/offer')
  @HttpCode(200)
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  offerParticipation(
    @CurrentUser() user: UserEntity,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('participationId', new ParseUUIDPipe({ version: '4' })) participationId: string,
    @Body() dto: OfferParticipationDto,
  ) { return this.tables.offerParticipation(id, participationId, user, dto) }

  @Post(':id/participations/:participationId/accept')
  @HttpCode(200)
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  acceptOffer(@CurrentUser() user: UserEntity, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('participationId', new ParseUUIDPipe({ version: '4' })) participationId: string) {
    return this.tables.acceptOffer(id, participationId, user)
  }

  @Post(':id/participations/:participationId/reject')
  @HttpCode(200)
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  rejectParticipation(@CurrentUser() user: UserEntity, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('participationId', new ParseUUIDPipe({ version: '4' })) participationId: string) {
    return this.tables.rejectParticipation(id, participationId, user)
  }

  @Delete(':id/participations/:participationId')
  @HttpCode(204)
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  async cancelParticipation(@CurrentUser() user: UserEntity, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('participationId', new ParseUUIDPipe({ version: '4' })) participationId: string): Promise<void> {
    await this.tables.cancelParticipation(id, participationId, user)
  }
}
