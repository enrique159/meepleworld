import { IsOptional, IsString, IsUrl, Length, MaxLength } from 'class-validator'

export class UpdateProfileDto {
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
