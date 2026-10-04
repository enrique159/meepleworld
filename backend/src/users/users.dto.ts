import { Transform } from 'class-transformer'
import { IsOptional, IsString, IsUrl, Length, Matches, MaxLength, ValidateIf } from 'class-validator'
import { normalizeUsername, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from './username.js'

export class UsernameParamsDto {
  @Transform(({ value }) => typeof value === 'string' ? normalizeUsername(value) : value)
  @IsString()
  @Length(USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH)
  @Matches(USERNAME_PATTERN, { message: 'El username solo puede contener letras de a a z, números y guion bajo.' })
  username!: string
}

export class UpdateProfileDto {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Transform(({ value }) => typeof value === 'string' ? normalizeUsername(value) : value)
  @IsString()
  @Length(USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH)
  @Matches(USERNAME_PATTERN, { message: 'El username solo puede contener letras de a a z, números y guion bajo.' })
  username?: string

  @IsOptional()
  @IsString()
  @Length(1, 120)
  displayName?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string | null

  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(2048)
  avatarUrl?: string | null
}
