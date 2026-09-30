import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { In, IsNull, Not } from 'typeorm'
import { DatabaseService } from '../database/database.service.js'
import { GameEntity } from '../database/entities/game.entity.js'
import { GameCondition, ListingKind, ListingStatus, MarketplaceListingEntity } from '../database/entities/marketplace-listing.entity.js'
import { UserEntity, UserStatus } from '../database/entities/user.entity.js'
import type { CloseListingDto, CreateListingDto, ListingQueryDto, UpdateListingDto } from './marketplace.dto.js'

@Injectable()
export class MarketplaceService {
  constructor(private readonly database: DatabaseService) {}

  async list(query: ListingQueryDto) {
    const builder = this.database.dataSource.getRepository(MarketplaceListingEntity).createQueryBuilder('listing')
      .innerJoin(UserEntity, 'author', 'author.id = listing.authorUserId AND author.status = :activeUser AND author.emailVerifiedAt IS NOT NULL', { activeUser: UserStatus.ACTIVE })
      .where('listing.status = :activeListing', { activeListing: ListingStatus.ACTIVE })
    if (query.kind) builder.andWhere('listing.kind = :kind', { kind: query.kind })
    if (query.city) builder.andWhere('listing.city LIKE :city', { city: `%${escapeLike(query.city.trim())}%` })
    if (query.q) builder.andWhere('EXISTS (SELECT 1 FROM games g WHERE g.id = listing.gameId AND g.name LIKE :q)', { q: `%${escapeLike(query.q.trim())}%` })
    if (query.gameId) builder.andWhere('listing.gameId = :gameId', { gameId: query.gameId })
    builder.orderBy('listing.createdAt', 'DESC').addOrderBy('listing.id', 'ASC')
      .skip((query.page - 1) * query.pageSize).take(query.pageSize)
    const [listings, total] = await builder.getManyAndCount()
    return {
      items: await this.mapListingViews(listings),
      page: query.page,
      pageSize: query.pageSize,
      total,
    }
  }

  async get(id: string) {
    const listing = await this.database.dataSource.getRepository(MarketplaceListingEntity).findOneBy({ id, status: ListingStatus.ACTIVE })
    if (!listing) throw new NotFoundException('No se encontró el anuncio.')
    const [view] = await this.mapListingViews([listing])
    if (!view) throw new NotFoundException('No se encontró el anuncio.')
    return view
  }

  async create(author: UserEntity, input: CreateListingDto) {
    const game = await this.database.dataSource.getRepository(GameEntity).findOneBy({ id: input.gameId })
    if (!game) throw new NotFoundException('No se encontró el juego.')
    validateListingValues(input.kind, input.condition ?? null, input.priceMxn ?? null, input.budgetMxn ?? null)
    const listing = this.database.dataSource.getRepository(MarketplaceListingEntity).create({
      id: randomUUID(),
      authorUserId: author.id,
      gameId: game.id,
      kind: input.kind,
      description: input.description.trim(),
      city: input.city.trim(),
      condition: input.condition ?? (input.kind === ListingKind.SALE ? GameCondition.GOOD : null),
      priceMxn: input.priceMxn ?? null,
      budgetMxn: input.budgetMxn ?? null,
      imageUrls: input.imageUrls ?? [],
      status: ListingStatus.ACTIVE,
    })
    await this.database.dataSource.getRepository(MarketplaceListingEntity).save(listing)
    const [view] = await this.mapListingViews([listing])
    return view
  }

  async update(id: string, author: UserEntity, input: UpdateListingDto) {
    const repository = this.database.dataSource.getRepository(MarketplaceListingEntity)
    const listing = await repository.findOneBy({ id, authorUserId: author.id })
    if (!listing) throw new NotFoundException('No se encontró el anuncio.')
    if (listing.status !== ListingStatus.ACTIVE) throw new ConflictException('El anuncio ya no está activo.')

    const condition = input.condition !== undefined ? input.condition : listing.condition
    const priceMxn = input.priceMxn !== undefined ? input.priceMxn : listing.priceMxn
    const budgetMxn = input.budgetMxn !== undefined ? input.budgetMxn : listing.budgetMxn
    validateListingValues(listing.kind, condition, priceMxn, budgetMxn)
    if (input.description !== undefined) listing.description = input.description.trim()
    if (input.city !== undefined) listing.city = input.city.trim()
    if (input.condition !== undefined) listing.condition = input.condition
    if (input.priceMxn !== undefined) listing.priceMxn = input.priceMxn
    if (input.budgetMxn !== undefined) listing.budgetMxn = input.budgetMxn
    if (input.imageUrls !== undefined) listing.imageUrls = input.imageUrls
    await repository.save(listing)
    const [view] = await this.mapListingViews([listing])
    return view
  }

  async close(id: string, author: UserEntity, input: CloseListingDto) {
    const repository = this.database.dataSource.getRepository(MarketplaceListingEntity)
    const listing = await repository.findOneBy({ id, authorUserId: author.id })
    if (!listing) throw new NotFoundException('No se encontró el anuncio.')
    if (listing.status !== ListingStatus.ACTIVE) throw new ConflictException('El anuncio ya no está activo.')
    if (listing.kind === ListingKind.SALE && ![ListingStatus.SOLD, ListingStatus.CLOSED].includes(input.outcome)) {
      throw new ConflictException('Un anuncio de venta solo puede marcarse vendido o cerrarse.')
    }
    if (listing.kind === ListingKind.WANTED && ![ListingStatus.RESOLVED, ListingStatus.CLOSED].includes(input.outcome)) {
      throw new ConflictException('Un anuncio de búsqueda solo puede marcarse resuelto o cerrarse.')
    }
    listing.status = input.outcome
    await repository.save(listing)
    return { id: listing.id, status: listing.status }
  }

  private async mapListingViews(listings: MarketplaceListingEntity[]) {
    if (listings.length === 0) return []
    const gameIds = [...new Set(listings.map((listing) => listing.gameId))]
    const authorIds = [...new Set(listings.map((listing) => listing.authorUserId))]
    const [games, authors] = await Promise.all([
      this.database.dataSource.getRepository(GameEntity).find({ where: { id: In(gameIds) } }),
      this.database.dataSource.getRepository(UserEntity).find({
        where: { id: In(authorIds), status: UserStatus.ACTIVE, emailVerifiedAt: Not(IsNull()) },
        select: { id: true, displayName: true, avatarUrl: true, city: true },
      }),
    ])
    const gameMap = new Map(games.map((game) => [game.id, game]))
    const authorMap = new Map(authors.map((user) => [user.id, user]))
    return listings.flatMap((listing) => {
      const game = gameMap.get(listing.gameId)
      const author = authorMap.get(listing.authorUserId)
      if (!game || !author) return []
      return [{
        id: listing.id,
        kind: listing.kind,
        gameId: game.id,
        gameName: game.name,
        imageUrl: game.imageUrl,
        city: listing.city,
        description: listing.description,
        condition: listing.condition,
        priceMxn: listing.priceMxn,
        budgetMxn: listing.budgetMxn,
        imageUrls: listing.imageUrls,
        status: listing.status,
        createdAt: listing.createdAt.toISOString(),
        author: { id: author.id, displayName: author.displayName, avatarUrl: author.avatarUrl, city: author.city },
      }]
    })
  }
}

function validateListingValues(kind: ListingKind, condition: GameCondition | null, priceMxn: string | null, budgetMxn: string | null): void {
  if (kind === ListingKind.SALE) {
    if (!condition || priceMxn === null || !hasNonNegativeAmount(priceMxn)) throw new ConflictException('Una venta requiere condición y precio en MXN.')
    if (budgetMxn !== null) throw new ConflictException('Un anuncio de venta no puede tener presupuesto de búsqueda.')
  } else {
    if (priceMxn !== null) throw new ConflictException('Un anuncio de búsqueda no puede tener precio de venta.')
    if (budgetMxn !== null && !hasNonNegativeAmount(budgetMxn)) throw new ConflictException('El presupuesto debe ser un importe válido en MXN.')
  }
}

function hasNonNegativeAmount(value: string): boolean {
  return /^\d{1,8}(\.\d{1,2})?$/.test(value)
}

function escapeLike(value: string): string { return value.replace(/[\\%_]/g, '\\$&') }
