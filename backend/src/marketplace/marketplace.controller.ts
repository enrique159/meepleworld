import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/current-user.decorator.js'
import { UserEntity } from '../database/entities/user.entity.js'
import { AccessTokenGuard, VerifiedEmailGuard } from '../auth/access-token.guard.js'
import { CloseListingDto, CreateListingDto, ListingQueryDto, UpdateListingDto } from './marketplace.dto.js'
import { MarketplaceService } from './marketplace.service.js'

@Controller('marketplace/listings')
export class MarketplaceController {
  constructor(private readonly marketplace: MarketplaceService) {}

  @Get()
  list(@Query() query: ListingQueryDto) { return this.marketplace.list(query) }

  @Get(':id')
  get(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) { return this.marketplace.get(id) }

  @Post()
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateListingDto) { return this.marketplace.create(user, dto) }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  update(@CurrentUser() user: UserEntity, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: UpdateListingDto) {
    return this.marketplace.update(id, user, dto)
  }

  @Post(':id/close')
  @HttpCode(200)
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  close(@CurrentUser() user: UserEntity, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: CloseListingDto = new CloseListingDto()) {
    return this.marketplace.close(id, user, dto)
  }
}
