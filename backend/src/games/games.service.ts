import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { DatabaseService } from '../database/database.service.js'
import { GameEntity, LibraryEntryEntity, LibraryEntrySource } from '../database/entities/game.entity.js'
import { UserEntity } from '../database/entities/user.entity.js'
import type { AddLibraryEntryDto, CreateGameDto, GameQueryDto } from './games.dto.js'

@Injectable()
export class GamesService {
  constructor(private readonly database: DatabaseService) {}

  async listGames(query: GameQueryDto) {
    const repository = this.database.dataSource.getRepository(GameEntity)
    const builder = repository.createQueryBuilder('game')
    if (query.q) builder.andWhere('game.name LIKE :q', { q: `%${escapeLike(query.q.trim())}%` })
    builder.orderBy('game.name', 'ASC').addOrderBy('game.id', 'ASC')
      .skip((query.page - 1) * query.pageSize).take(query.pageSize)
    const [games, total] = await builder.getManyAndCount()
    return { items: games.map(gameView), page: query.page, pageSize: query.pageSize, total }
  }

  async getGame(id: string) {
    const game = await this.database.dataSource.getRepository(GameEntity).findOneBy({ id })
    if (!game) throw new NotFoundException('No se encontró el juego.')
    return gameView(game)
  }

  async createGame(input: CreateGameDto) {
    if (input.minPlayers && input.maxPlayers && input.minPlayers > input.maxPlayers) {
      throw new ConflictException('El mínimo de jugadores no puede superar el máximo.')
    }
    const game = this.database.dataSource.getRepository(GameEntity).create({
      id: randomUUID(),
      name: input.name.trim(),
      imageUrl: input.imageUrl ?? null,
      minPlayers: input.minPlayers ?? null,
      maxPlayers: input.maxPlayers ?? null,
      playingTimeMinutes: input.playingTimeMinutes ?? null,
      bggId: null,
    })
    return gameView(await this.database.dataSource.getRepository(GameEntity).save(game))
  }

  async getLibrary(user: UserEntity) {
    const rows = await this.database.dataSource.getRepository(LibraryEntryEntity)
      .createQueryBuilder('entry')
      .innerJoin(GameEntity, 'game', 'game.id = entry.gameId')
      .select('game.id', 'id')
      .addSelect('game.name', 'name')
      .addSelect('game.imageUrl', 'imageUrl')
      .addSelect('game.minPlayers', 'minPlayers')
      .addSelect('game.maxPlayers', 'maxPlayers')
      .addSelect('game.playingTimeMinutes', 'playingTimeMinutes')
      .addSelect('game.bggId', 'bggId')
      .addSelect('entry.source', 'source')
      .addSelect('entry.addedAt', 'addedAt')
      .where('entry.userId = :userId', { userId: user.id })
      .orderBy('game.name', 'ASC')
      .getRawMany<Record<string, unknown>>()
    return { items: rows.map((row) => ({ ...gameView(row), source: row.source, addedAt: dateString(row.addedAt) })) }
  }

  async addToLibrary(user: UserEntity, input: AddLibraryEntryDto) {
    const games = this.database.dataSource.getRepository(GameEntity)
    const game = await games.findOneBy({ id: input.gameId })
    if (!game) throw new NotFoundException('No se encontró el juego.')
    const entries = this.database.dataSource.getRepository(LibraryEntryEntity)
    if (await entries.findOneBy({ userId: user.id, gameId: game.id })) throw new ConflictException('Ese juego ya está en tu biblioteca.')
    const entry = entries.create({ id: randomUUID(), userId: user.id, gameId: game.id, source: LibraryEntrySource.MANUAL, bggUserName: null })
    await entries.save(entry)
    return gameView(game)
  }

  async removeFromLibrary(user: UserEntity, gameId: string): Promise<void> {
    const result = await this.database.dataSource.getRepository(LibraryEntryEntity).delete({ userId: user.id, gameId })
    if (result.affected === 0) throw new NotFoundException('Ese juego no está en tu biblioteca.')
  }
}

function gameView(game: GameEntity | Record<string, unknown>) {
  const value = game as Record<string, unknown>
  return {
    id: String(value.id),
    name: String(value.name),
    imageUrl: nullableString(value.imageUrl),
    minPlayers: nullableNumber(value.minPlayers),
    maxPlayers: nullableNumber(value.maxPlayers),
    playingTimeMinutes: nullableNumber(value.playingTimeMinutes),
    bggId: nullableNumber(value.bggId),
  }
}

function nullableString(value: unknown): string | undefined { return typeof value === 'string' && value.length ? value : undefined }
function nullableNumber(value: unknown): number | undefined { return value === null || value === undefined ? undefined : Number(value) }
function dateString(value: unknown): string { return value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString() }
function escapeLike(value: string): string { return value.replace(/[\\%_]/g, '\\$&') }
