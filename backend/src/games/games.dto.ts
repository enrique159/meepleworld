import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, IsUrl, IsUUID, Length, Max, Min } from 'class-validator'

export class GameQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  q?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 30
}

export class CreateGameDto {
  @IsString()
  @Length(1, 180)
  name!: string

  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  imageUrl?: string | null

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  minPlayers?: number | null

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  maxPlayers?: number | null

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  playingTimeMinutes?: number | null
}

export class AddLibraryEntryDto {
  @IsUUID('4')
  gameId!: string
}
