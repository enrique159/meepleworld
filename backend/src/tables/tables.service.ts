import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { randomBytes, randomUUID } from 'node:crypto'
import { EntityManager, In, IsNull, Not, Repository } from 'typeorm'
import { DatabaseService } from '../database/database.service.js'
import { GameEntity, LibraryEntryEntity } from '../database/entities/game.entity.js'
import { TableEntity, TableGameEntity, TableParticipationEntity, TableStatus, TableAccessMode, LocationVisibility, ParticipationStatus } from '../database/entities/table.entity.js'
import { UserEntity, UserStatus } from '../database/entities/user.entity.js'
import type { CreateParticipationDto, CreateTableDto, OfferParticipationDto, TableQueryDto, UpdateTableDto } from './tables.dto.js'

@Injectable()
export class TablesService {
  constructor(private readonly database: DatabaseService) {}

  async list(query: TableQueryDto) {
    const tables = this.database.dataSource.getRepository(TableEntity)
    const builder = tables.createQueryBuilder('table').where('table.status = :status', { status: TableStatus.PUBLISHED })
      .andWhere('EXISTS (SELECT 1 FROM users host WHERE host.id = table.hostUserId AND host.status = :hostStatus)', { hostStatus: 'active' })
    builder.andWhere('table.startsAt > :now', { now: new Date() })
    if (query.city) builder.andWhere('table.city LIKE :city', { city: `%${escapeLike(query.city.trim())}%` })
    if (query.q) builder.andWhere('(table.title LIKE :q OR table.description LIKE :q)', { q: `%${escapeLike(query.q.trim())}%` })
    if (query.startsAfter) builder.andWhere('table.startsAt >= :startsAfter', { startsAfter: new Date(query.startsAfter) })
    if (query.startsBefore) builder.andWhere('table.startsAt <= :startsBefore', { startsBefore: new Date(query.startsBefore) })
    if (query.gameId) builder.andWhere('EXISTS (SELECT 1 FROM table_games tg WHERE tg.table_id = table.id AND tg.game_id = :gameId)', { gameId: query.gameId })
    if (query.availableOnly) {
      builder.andWhere(`table.offeredSeats > (SELECT COALESCE(SUM(p.confirmed_seats), 0) FROM table_participations p WHERE p.table_id = table.id AND p.status = :confirmedStatus)`, { confirmedStatus: ParticipationStatus.CONFIRMED })
    }
    builder.orderBy('table.startsAt', 'ASC').addOrderBy('table.id', 'ASC')
      .skip((query.page - 1) * query.pageSize).take(query.pageSize)
    const [rows, total] = await builder.getManyAndCount()
    const counts = await this.confirmedSeatCounts(rows.map((row) => row.id))
    const hosts = await this.getHosts(rows.map((row) => row.hostUserId))
    const games = await this.getTableGames(rows.map((row) => row.id))
    return {
      items: rows.map((row) => tableView(row, counts.get(row.id) ?? 0, hosts.get(row.hostUserId), games.get(row.id) ?? [])),
      page: query.page,
      pageSize: query.pageSize,
      total,
    }
  }

  async get(id: string) {
    const table = await this.database.dataSource.getRepository(TableEntity).findOneBy({ id, status: In([TableStatus.PUBLISHED, TableStatus.IN_PROGRESS, TableStatus.FINISHED]) })
    if (!table) throw new NotFoundException('No se encontró la mesa.')
    const [counts, hosts, games] = await Promise.all([
      this.confirmedSeatCounts([id]),
      this.getHosts([table.hostUserId]),
      this.getTableGames([id]),
    ])
    if (!hosts.has(table.hostUserId)) throw new NotFoundException('No se encontró la mesa.')
    return tableView(table, counts.get(id) ?? 0, hosts.get(table.hostUserId), games.get(id) ?? [])
  }

  async getPrivateLocation(id: string, user: UserEntity) {
    const table = await this.database.dataSource.getRepository(TableEntity).findOneBy({ id })
    if (!table) throw new NotFoundException('No se encontró la mesa.')
    const allowed = table.hostUserId === user.id || Boolean(await this.database.dataSource.getRepository(TableParticipationEntity).findOneBy({
      tableId: table.id,
      userId: user.id,
      status: ParticipationStatus.CONFIRMED,
    }))
    if (!allowed) throw new ForbiddenException('La ubicación exacta solo está disponible para el anfitrión y asistentes confirmados.')
    return {
      tableId: table.id,
      addressLine: table.addressLine,
      latitude: decimalNumber(table.latitude),
      longitude: decimalNumber(table.longitude),
      instructions: table.instructions,
    }
  }

  async create(host: UserEntity, input: CreateTableDto) {
    const startsAt = parseFutureDate(input.startsAt)
    this.assertFutureStart(startsAt)
    assertTimeZone(input.timeZone)
    if (input.locationVisibility === LocationVisibility.CONFIRMED_ONLY && !input.addressLine?.trim()) {
      throw new ConflictException('Una mesa con ubicación privada debe incluir la dirección exacta.')
    }
    const gameIds = [...new Set(input.gameIds)]
    await this.assertGamesInHostLibrary(host.id, gameIds)
    const table = this.database.dataSource.getRepository(TableEntity).create({
      id: randomUUID(),
      hostUserId: host.id,
      title: input.title.trim(),
      description: input.description.trim(),
      city: input.city.trim(),
      startsAt,
      timeZone: input.timeZone,
      durationMinutes: input.durationMinutes ?? null,
      initialGroupSize: input.initialGroupSize,
      offeredSeats: input.offeredSeats,
      accessMode: input.accessMode,
      locationVisibility: input.locationVisibility,
      addressLine: input.addressLine?.trim() || null,
      latitude: input.latitude.toFixed(7),
      longitude: input.longitude.toFixed(7),
      ...approximateLocation(input.latitude, input.longitude, input.locationVisibility),
      feeMxn: input.feeMxn ?? '0.00',
      amenities: input.amenities.map((amenity) => amenity.trim()).filter(Boolean),
      instructions: input.instructions?.trim() || null,
      status: TableStatus.PUBLISHED,
    })

    await this.database.dataSource.transaction(async (manager) => {
      await manager.getRepository(TableEntity).save(table)
      await manager.getRepository(TableGameEntity).save(gameIds.map((gameId) => ({ tableId: table.id, gameId })))
    })
    return this.get(table.id)
  }

  async update(id: string, host: UserEntity, input: UpdateTableDto) {
    await this.database.dataSource.transaction(async (manager) => {
      const tables = manager.getRepository(TableEntity)
      const table = await tables.createQueryBuilder('table').where('table.id = :id', { id }).setLock('pessimistic_write').getOne()
      if (!table) throw new NotFoundException('No se encontró la mesa.')
      this.assertHost(table, host)
      if (table.status !== TableStatus.PUBLISHED || table.startsAt <= new Date()) throw new ConflictException('La mesa ya no admite cambios.')

      const confirmed = await this.confirmedSeatCount(manager.getRepository(TableParticipationEntity), table.id)
      const nextCapacity = input.offeredSeats ?? table.offeredSeats
      if (nextCapacity < confirmed) throw new ConflictException('No puedes reducir el cupo por debajo de los lugares confirmados.')

      if (input.title !== undefined) table.title = input.title.trim()
      if (input.description !== undefined) table.description = input.description.trim()
      if (input.city !== undefined) table.city = input.city.trim()
      if (input.startsAt !== undefined) {
        table.startsAt = parseFutureDate(input.startsAt)
        this.assertFutureStart(table.startsAt)
      }
      if (input.timeZone !== undefined) { assertTimeZone(input.timeZone); table.timeZone = input.timeZone }
      if (input.durationMinutes !== undefined) table.durationMinutes = input.durationMinutes
      if (input.initialGroupSize !== undefined) table.initialGroupSize = input.initialGroupSize
      if (input.offeredSeats !== undefined) table.offeredSeats = input.offeredSeats
      if (input.accessMode !== undefined) table.accessMode = input.accessMode
      if (input.locationVisibility !== undefined) table.locationVisibility = input.locationVisibility
      if (input.addressLine !== undefined) table.addressLine = input.addressLine?.trim() || null
      if (input.latitude !== undefined) table.latitude = input.latitude.toFixed(7)
      if (input.longitude !== undefined) table.longitude = input.longitude.toFixed(7)
      if ((input.latitude !== undefined || input.longitude !== undefined) && (!table.latitude || !table.longitude)) throw new ConflictException('La ubicación requiere latitud y longitud.')
      if (table.locationVisibility === LocationVisibility.CONFIRMED_ONLY && !table.addressLine) {
        throw new ConflictException('Una mesa con ubicación privada debe incluir la dirección exacta.')
      }
      if (input.latitude !== undefined || input.longitude !== undefined || input.locationVisibility !== undefined) {
        Object.assign(table, approximateLocation(Number(table.latitude), Number(table.longitude), table.locationVisibility))
      }
      if (input.feeMxn !== undefined) table.feeMxn = input.feeMxn
      if (input.amenities !== undefined) table.amenities = input.amenities.map((amenity) => amenity.trim()).filter(Boolean)
      if (input.instructions !== undefined) table.instructions = input.instructions?.trim() || null
      await tables.save(table)

      if (input.gameIds !== undefined) {
        const gameIds = [...new Set(input.gameIds)]
        await this.assertGamesInHostLibrary(host.id, gameIds, manager)
        await manager.getRepository(TableGameEntity).delete({ tableId: id })
        await manager.getRepository(TableGameEntity).save(gameIds.map((gameId) => ({ tableId: id, gameId })))
      }
    })
    return this.get(id)
  }

  async cancel(id: string, host: UserEntity): Promise<{ status: TableStatus.CANCELLED }> {
    return this.database.dataSource.transaction(async (manager) => {
      const table = await manager.getRepository(TableEntity).createQueryBuilder('table')
        .where('table.id = :id', { id }).setLock('pessimistic_write').getOne()
      if (!table) throw new NotFoundException('No se encontró la mesa.')
      this.assertHost(table, host)
      if (table.status === TableStatus.CANCELLED) return { status: TableStatus.CANCELLED }
      if (table.status !== TableStatus.PUBLISHED || table.startsAt <= new Date()) throw new ConflictException('Solo puedes cancelar una mesa publicada antes de su inicio.')
      table.status = TableStatus.CANCELLED
      await manager.getRepository(TableEntity).save(table)
      await manager.getRepository(TableParticipationEntity).createQueryBuilder().update()
        .set({ status: ParticipationStatus.CANCELLED, confirmedSeats: null, offeredSeats: null })
        .where('table_id = :tableId AND status IN (:...statuses)', {
          tableId: id,
          statuses: [ParticipationStatus.PENDING, ParticipationStatus.PARTIAL_OFFERED, ParticipationStatus.CONFIRMED],
        }).execute()
      return { status: TableStatus.CANCELLED }
    })
  }

  async requestParticipation(tableId: string, user: UserEntity, input: CreateParticipationDto) {
    return this.database.dataSource.transaction(async (manager) => {
      const table = await this.lockTable(manager, tableId)
      this.assertAccepting(table)
      if (table.hostUserId === user.id) throw new ConflictException('El anfitrión ya forma parte del grupo inicial.')
      const participations = manager.getRepository(TableParticipationEntity)
      const existing = await participations.findOne({
        where: { tableId, userId: user.id, status: In([ParticipationStatus.PENDING, ParticipationStatus.PARTIAL_OFFERED, ParticipationStatus.CONFIRMED]) },
      })
      if (existing) {
        if (existing.requestedSeats === input.requestedSeats) return participationView(existing)
        throw new ConflictException('Ya tienes una participación vigente en esta mesa.')
      }
      const available = table.offeredSeats - await this.confirmedSeatCount(participations, tableId)
      if (available <= 0) throw new ConflictException('La mesa está llena.')
      if (table.accessMode === TableAccessMode.OPEN && input.requestedSeats > available) {
        throw new ConflictException(`Solo quedan ${available} lugares disponibles.`)
      }
      const participation = participations.create({
        id: randomUUID(),
        tableId,
        userId: user.id,
        requestedSeats: input.requestedSeats,
        offeredSeats: null,
        confirmedSeats: table.accessMode === TableAccessMode.OPEN ? input.requestedSeats : null,
        status: table.accessMode === TableAccessMode.OPEN ? ParticipationStatus.CONFIRMED : ParticipationStatus.PENDING,
      })
      await participations.save(participation)
      return participationView(participation)
    })
  }

  async listParticipations(tableId: string, host: UserEntity) {
    const table = await this.database.dataSource.getRepository(TableEntity).findOneBy({ id: tableId })
    if (!table) throw new NotFoundException('No se encontró la mesa.')
    this.assertHost(table, host)
    const participations = await this.database.dataSource.getRepository(TableParticipationEntity).find({
      where: { tableId }, order: { createdAt: 'ASC' },
    })
    const userIds = [...new Set(participations.map((p) => p.userId))]
    const users = userIds.length === 0 ? [] : await this.database.dataSource.getRepository(UserEntity).find({
      where: { id: In(userIds) }, select: { id: true, displayName: true, avatarUrl: true },
    })
    const userMap = new Map(users.map((user) => [user.id, { id: user.id, displayName: user.displayName, avatarUrl: user.avatarUrl }]))
    return { items: participations.map((participation) => ({ ...participationView(participation), user: userMap.get(participation.userId) ?? null })) }
  }

  async offerParticipation(tableId: string, participationId: string, host: UserEntity, input: OfferParticipationDto) {
    return this.database.dataSource.transaction(async (manager) => {
      const table = await this.lockTable(manager, tableId)
      this.assertHost(table, host)
      this.assertAccepting(table)
      const repository = manager.getRepository(TableParticipationEntity)
      const participation = await repository.findOne({ where: { id: participationId, tableId } })
      if (!participation || participation.status !== ParticipationStatus.PENDING) throw new ConflictException('La solicitud ya no está pendiente.')
      if (input.seats > participation.requestedSeats) throw new ConflictException('La oferta no puede superar los lugares solicitados.')
      const available = table.offeredSeats - await this.confirmedSeatCount(repository, tableId)
      if (input.seats > available) throw new ConflictException(`Solo quedan ${available} lugares disponibles.`)
      if (input.seats === participation.requestedSeats) {
        participation.confirmedSeats = input.seats
        participation.offeredSeats = null
        participation.status = ParticipationStatus.CONFIRMED
      } else {
        participation.offeredSeats = input.seats
        participation.confirmedSeats = null
        participation.status = ParticipationStatus.PARTIAL_OFFERED
      }
      await repository.save(participation)
      return participationView(participation)
    })
  }

  async acceptOffer(tableId: string, participationId: string, user: UserEntity) {
    return this.database.dataSource.transaction(async (manager) => {
      const table = await this.lockTable(manager, tableId)
      this.assertAccepting(table)
      const repository = manager.getRepository(TableParticipationEntity)
      const participation = await repository.findOne({ where: { id: participationId, tableId, userId: user.id } })
      if (participation?.status === ParticipationStatus.CONFIRMED) return participationView(participation)
      if (!participation || participation.status !== ParticipationStatus.PARTIAL_OFFERED || !participation.offeredSeats) {
        throw new ConflictException('No tienes una oferta parcial pendiente para esta mesa.')
      }
      const available = table.offeredSeats - await this.confirmedSeatCount(repository, tableId)
      if (participation.offeredSeats > available) throw new ConflictException(`La oferta ya no cabe. Quedan ${available} lugares disponibles.`)
      participation.confirmedSeats = participation.offeredSeats
      participation.status = ParticipationStatus.CONFIRMED
      await repository.save(participation)
      return participationView(participation)
    })
  }

  async rejectParticipation(tableId: string, participationId: string, host: UserEntity) {
    return this.database.dataSource.transaction(async (manager) => {
      const table = await this.lockTable(manager, tableId)
      this.assertHost(table, host)
      const repository = manager.getRepository(TableParticipationEntity)
      const participation = await repository.findOne({ where: { id: participationId, tableId } })
      if (!participation || ![ParticipationStatus.PENDING, ParticipationStatus.PARTIAL_OFFERED].includes(participation.status)) {
        throw new ConflictException('La solicitud ya no puede rechazarse.')
      }
      participation.status = ParticipationStatus.REJECTED
      participation.offeredSeats = null
      await repository.save(participation)
      return participationView(participation)
    })
  }

  async cancelParticipation(tableId: string, participationId: string, user: UserEntity): Promise<void> {
    await this.database.dataSource.transaction(async (manager) => {
      const table = await this.lockTable(manager, tableId)
      const repository = manager.getRepository(TableParticipationEntity)
      const participation = await repository.findOne({ where: { id: participationId, tableId, userId: user.id } })
      if (!participation) throw new NotFoundException('No se encontró tu participación.')
      if (participation.status === ParticipationStatus.CANCELLED) return
      if (table.startsAt <= new Date() || table.status !== TableStatus.PUBLISHED) throw new ConflictException('La participación ya no se puede cancelar desde la aplicación.')
      if (![ParticipationStatus.PENDING, ParticipationStatus.PARTIAL_OFFERED, ParticipationStatus.CONFIRMED].includes(participation.status)) {
        throw new ConflictException('La participación ya no se puede cancelar.')
      }
      participation.status = ParticipationStatus.CANCELLED
      participation.confirmedSeats = null
      participation.offeredSeats = null
      await repository.save(participation)
    })
  }

  private async lockTable(manager: EntityManager, id: string): Promise<TableEntity> {
    const table = await manager.getRepository(TableEntity).createQueryBuilder('table')
      .where('table.id = :id', { id }).setLock('pessimistic_write').getOne()
    if (!table) throw new NotFoundException('No se encontró la mesa.')
    return table
  }

  private assertHost(table: TableEntity, user: UserEntity): void {
    if (table.hostUserId !== user.id) throw new ForbiddenException('Solo el anfitrión puede realizar esta acción.')
  }

  private assertAccepting(table: TableEntity): void {
    if (table.status !== TableStatus.PUBLISHED || table.startsAt <= new Date()) throw new ConflictException('La mesa ya no acepta solicitudes.')
  }

  private assertFutureStart(startsAt: Date): void {
    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) throw new ConflictException('La fecha de inicio debe ser futura.')
  }

  private async assertGamesInHostLibrary(hostId: string, gameIds: string[], manager = this.database.dataSource.manager): Promise<void> {
    const count = await manager.getRepository(LibraryEntryEntity).createQueryBuilder('entry')
      .where('entry.userId = :hostId', { hostId }).andWhere('entry.gameId IN (:...gameIds)', { gameIds }).getCount()
    if (count !== gameIds.length) throw new ConflictException('Solo puedes proponer juegos que estén en tu biblioteca.')
  }

  private async confirmedSeatCount(repository: Repository<TableParticipationEntity>, tableId: string): Promise<number> {
    const result = await repository.createQueryBuilder('participation')
      .select('COALESCE(SUM(participation.confirmedSeats), 0)', 'seats')
      .where('participation.tableId = :tableId', { tableId })
      .andWhere('participation.status = :status', { status: ParticipationStatus.CONFIRMED })
      .getRawOne<{ seats: string | number }>()
    return Number(result?.seats ?? 0)
  }

  private async confirmedSeatCounts(tableIds: string[]): Promise<Map<string, number>> {
    if (tableIds.length === 0) return new Map()
    const rows = await this.database.dataSource.getRepository(TableParticipationEntity).createQueryBuilder('participation')
      .select('participation.tableId', 'tableId')
      .addSelect('COALESCE(SUM(participation.confirmedSeats), 0)', 'seats')
      .where('participation.tableId IN (:...tableIds)', { tableIds })
      .andWhere('participation.status = :status', { status: ParticipationStatus.CONFIRMED })
      .groupBy('participation.tableId').getRawMany<{ tableId: string; seats: string | number }>()
    return new Map(rows.map((row) => [row.tableId, Number(row.seats)]))
  }

  private async getHosts(hostIds: string[]): Promise<Map<string, { id: string; displayName: string; avatarUrl: string | null }>> {
    const ids = [...new Set(hostIds)]
    if (ids.length === 0) return new Map()
    const users = await this.database.dataSource.getRepository(UserEntity).find({
      where: { id: In(ids), status: UserStatus.ACTIVE, emailVerifiedAt: Not(IsNull()) },
      select: { id: true, displayName: true, avatarUrl: true },
    })
    return new Map(users.map((user) => [user.id, { id: user.id, displayName: user.displayName, avatarUrl: user.avatarUrl }]))
  }

  private async getTableGames(tableIds: string[]): Promise<Map<string, Array<{ id: string; name: string; imageUrl: string | null }>>> {
    if (tableIds.length === 0) return new Map()
    const rows = await this.database.dataSource.getRepository(TableGameEntity).createQueryBuilder('tableGame')
      .innerJoin(GameEntity, 'game', 'game.id = tableGame.gameId')
      .select('tableGame.tableId', 'tableId').addSelect('game.id', 'id').addSelect('game.name', 'name').addSelect('game.imageUrl', 'imageUrl')
      .where('tableGame.tableId IN (:...tableIds)', { tableIds }).orderBy('game.name', 'ASC')
      .getRawMany<{ tableId: string; id: string; name: string; imageUrl: string | null }>()
    const result = new Map<string, Array<{ id: string; name: string; imageUrl: string | null }>>()
    for (const row of rows) {
      const list = result.get(row.tableId) ?? []
      list.push({ id: row.id, name: row.name, imageUrl: row.imageUrl })
      result.set(row.tableId, list)
    }
    return result
  }
}

function tableView(table: TableEntity, confirmedSeats: number, host?: { id: string; displayName: string; avatarUrl: string | null }, games: Array<{ id: string; name: string; imageUrl: string | null }> = []) {
  const isPublic = table.locationVisibility === LocationVisibility.PUBLIC
  const approximate = !isPublic
  return {
    id: table.id,
    title: table.title,
    description: table.description,
    city: table.city,
    startsAt: table.startsAt.toISOString(),
    timeZone: table.timeZone,
    durationMinutes: table.durationMinutes,
    initialGroupSize: table.initialGroupSize,
    offeredSeats: table.offeredSeats,
    availableSeats: Math.max(0, table.offeredSeats - confirmedSeats),
    accessMode: table.accessMode,
    locationVisibility: table.locationVisibility,
    latitude: decimalNumber(approximate ? table.publicLatitude : table.latitude),
    longitude: decimalNumber(approximate ? table.publicLongitude : table.longitude),
    locationApproximate: approximate,
    ...(isPublic ? { addressLine: table.addressLine } : {}),
    feeMxn: table.feeMxn,
    amenities: table.amenities,
    status: table.status,
    ...(host ? { host } : {}),
    games,
  }
}

function participationView(participation: TableParticipationEntity) {
  return {
    id: participation.id,
    tableId: participation.tableId,
    requestedSeats: participation.requestedSeats,
    offeredSeats: participation.offeredSeats,
    confirmedSeats: participation.confirmedSeats,
    status: participation.status,
    createdAt: participation.createdAt.toISOString(),
  }
}

function approximateLocation(latitude: number, longitude: number, visibility: LocationVisibility) {
  if (visibility === LocationVisibility.PUBLIC) return { publicLatitude: null, publicLongitude: null }
  const angle = randomBytes(4).readUInt32BE() / 0xffff_ffff * Math.PI * 2
  const distance = 500 + randomBytes(2).readUInt16BE() / 0xffff * 700
  const latitudeOffset = distance / 111_320 * Math.cos(angle)
  const longitudeOffset = distance / (111_320 * Math.max(0.2, Math.cos(latitude * Math.PI / 180))) * Math.sin(angle)
  return {
    publicLatitude: (latitude + latitudeOffset).toFixed(7),
    publicLongitude: (longitude + longitudeOffset).toFixed(7),
  }
}

function decimalNumber(value: string | null): number | null { return value === null ? null : Number(value) }
function parseFutureDate(value: string): Date {
  if (!/(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) throw new ConflictException('La fecha debe incluir zona horaria u offset UTC.')
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) throw new ConflictException('La fecha no es válida.')
  return parsed
}
function assertTimeZone(timeZone: string): void {
  try { new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date()) }
  catch { throw new ConflictException('La zona horaria debe ser un identificador IANA válido.') }
}
function escapeLike(value: string): string { return value.replace(/[\\%_]/g, '\\$&') }
