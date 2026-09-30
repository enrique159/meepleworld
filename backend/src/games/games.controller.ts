import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/current-user.decorator.js'
import { UserEntity } from '../database/entities/user.entity.js'
import { AccessTokenGuard, VerifiedEmailGuard } from '../auth/access-token.guard.js'
import { AddLibraryEntryDto, CreateGameDto, GameQueryDto } from './games.dto.js'
import { GamesService } from './games.service.js'

@Controller()
export class GamesController {
  constructor(private readonly games: GamesService) {}

  @Get('games')
  listGames(@Query() query: GameQueryDto) { return this.games.listGames(query) }

  @Get('games/:id')
  getGame(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) { return this.games.getGame(id) }

  @Post('games')
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  createGame(@CurrentUser() user: UserEntity, @Body() dto: CreateGameDto) {
    void user
    return this.games.createGame(dto)
  }

  @Get('library')
  @UseGuards(AccessTokenGuard)
  getLibrary(@CurrentUser() user: UserEntity) { return this.games.getLibrary(user) }

  @Post('library')
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  addToLibrary(@CurrentUser() user: UserEntity, @Body() dto: AddLibraryEntryDto) { return this.games.addToLibrary(user, dto) }

  @Delete('library/:gameId')
  @HttpCode(204)
  @UseGuards(AccessTokenGuard, VerifiedEmailGuard)
  async removeFromLibrary(@CurrentUser() user: UserEntity, @Param('gameId', new ParseUUIDPipe({ version: '4' })) gameId: string): Promise<void> {
    await this.games.removeFromLibrary(user, gameId)
  }
}
