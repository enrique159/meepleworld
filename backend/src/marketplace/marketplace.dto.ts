import { Transform, Type } from 'class-transformer'
import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsOptional, IsString, IsUrl, IsUUID, Length, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator'
import { GameCondition, ListingKind, ListingStatus } from '../database/entities/marketplace-listing.entity.js'

export class ListingQueryDto {
  @IsOptional() @IsEnum(ListingKind) kind?: ListingKind
  @IsOptional() @IsString() @MaxLength(120) city?: string
  @IsOptional() @IsString() @MaxLength(180) q?: string
  @IsOptional() @IsUUID('4') gameId?: string
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20
}

export class CreateListingDto {
  @IsUUID('4') gameId!: string
  @IsEnum(ListingKind) kind!: ListingKind
  @IsString() @Length(1, 5000) description!: string
  @IsString() @Length(1, 120) city!: string
  @IsOptional() @IsEnum(GameCondition) condition?: GameCondition | null
  @IsOptional() @IsString() @Matches(/^\d{1,8}(\.\d{1,2})?$/) priceMxn?: string | null
  @IsOptional() @IsString() @Matches(/^\d{1,8}(\.\d{1,2})?$/) budgetMxn?: string | null
  @ValidateIf((_object, value) => value !== undefined) @IsArray() @ArrayMaxSize(8) @IsUrl({ require_protocol: true, protocols: ['http', 'https'] }, { each: true }) imageUrls?: string[]
}

export class UpdateListingDto {
  @ValidateIf((_object, value) => value !== undefined) @IsString() @Length(1, 5000) description?: string
  @ValidateIf((_object, value) => value !== undefined) @IsString() @Length(1, 120) city?: string
  @IsOptional() @IsEnum(GameCondition) condition?: GameCondition | null
  @IsOptional() @IsString() @Matches(/^\d{1,8}(\.\d{1,2})?$/) priceMxn?: string | null
  @IsOptional() @IsString() @Matches(/^\d{1,8}(\.\d{1,2})?$/) budgetMxn?: string | null
  @ValidateIf((_object, value) => value !== undefined) @IsArray() @ArrayMaxSize(8) @IsUrl({ require_protocol: true, protocols: ['http', 'https'] }, { each: true }) imageUrls?: string[]
}

export class CloseListingDto {
  @IsOptional() @Transform(({ value }) => value ?? ListingStatus.CLOSED) @IsEnum(ListingStatus)
  outcome: ListingStatus = ListingStatus.CLOSED
}
