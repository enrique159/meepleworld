import { Transform, Type } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsEnum, IsInt, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Length, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator'
import { LocationVisibility, TableAccessMode } from '../database/entities/table.entity.js'

export class TableQueryDto {
  @IsOptional() @IsString() @MaxLength(120) city?: string
  @IsOptional() @IsString() @MaxLength(160) q?: string
  @IsOptional() @IsUUID('4') gameId?: string
  @IsOptional() @IsISO8601({ strict: true }) startsAfter?: string
  @IsOptional() @IsISO8601({ strict: true }) startsBefore?: string
  @IsOptional() @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value) @IsBoolean() availableOnly?: boolean
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20
}

export class CreateTableDto {
  @IsString() @Length(1, 160) title!: string
  @IsString() @Length(1, 5000) description!: string
  @IsString() @Length(1, 120) city!: string
  @IsISO8601({ strict: true }) startsAt!: string
  @IsString() @Length(1, 64) timeZone!: string
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1440) durationMinutes?: number | null
  @Type(() => Number) @IsInt() @Min(1) @Max(1000) initialGroupSize!: number
  @Type(() => Number) @IsInt() @Min(0) @Max(1000) offeredSeats!: number
  @IsEnum(TableAccessMode) accessMode!: TableAccessMode
  @IsEnum(LocationVisibility) locationVisibility!: LocationVisibility
  @IsOptional() @IsString() @MaxLength(240) addressLine?: string | null
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 7 }) @Min(-90) @Max(90) latitude!: number
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 7 }) @Min(-180) @Max(180) longitude!: number
  @ValidateIf((_object, value) => value !== undefined) @IsString() @Matches(/^\d{1,8}(\.\d{1,2})?$/) feeMxn?: string
  @IsArray() @ArrayMaxSize(24) @IsString({ each: true }) amenities!: string[]
  @IsOptional() @IsString() @Length(1, 3000) instructions?: string | null
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(20) @ArrayUnique() @IsUUID('4', { each: true }) gameIds!: string[]
}

export class UpdateTableDto {
  @ValidateIf((_object, value) => value !== undefined) @IsString() @Length(1, 160) title?: string
  @ValidateIf((_object, value) => value !== undefined) @IsString() @Length(1, 5000) description?: string
  @ValidateIf((_object, value) => value !== undefined) @IsString() @Length(1, 120) city?: string
  @ValidateIf((_object, value) => value !== undefined) @IsISO8601({ strict: true }) startsAt?: string
  @ValidateIf((_object, value) => value !== undefined) @IsString() @Length(1, 64) timeZone?: string
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1440) durationMinutes?: number | null
  @ValidateIf((_object, value) => value !== undefined) @Type(() => Number) @IsInt() @Min(1) @Max(1000) initialGroupSize?: number
  @ValidateIf((_object, value) => value !== undefined) @Type(() => Number) @IsInt() @Min(0) @Max(1000) offeredSeats?: number
  @ValidateIf((_object, value) => value !== undefined) @IsEnum(TableAccessMode) accessMode?: TableAccessMode
  @ValidateIf((_object, value) => value !== undefined) @IsEnum(LocationVisibility) locationVisibility?: LocationVisibility
  @IsOptional() @IsString() @MaxLength(240) addressLine?: string | null
  @ValidateIf((_object, value) => value !== undefined) @Type(() => Number) @IsNumber({ maxDecimalPlaces: 7 }) @Min(-90) @Max(90) latitude?: number
  @ValidateIf((_object, value) => value !== undefined) @Type(() => Number) @IsNumber({ maxDecimalPlaces: 7 }) @Min(-180) @Max(180) longitude?: number
  @ValidateIf((_object, value) => value !== undefined) @IsString() @Matches(/^\d{1,8}(\.\d{1,2})?$/) feeMxn?: string
  @ValidateIf((_object, value) => value !== undefined) @IsArray() @ArrayMaxSize(24) @IsString({ each: true }) amenities?: string[]
  @IsOptional() @IsString() @Length(1, 3000) instructions?: string | null
  @ValidateIf((_object, value) => value !== undefined) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(20) @ArrayUnique() @IsUUID('4', { each: true }) gameIds?: string[]
}

export class CreateParticipationDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(100) requestedSeats!: number
}

export class OfferParticipationDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(100) seats!: number
}
