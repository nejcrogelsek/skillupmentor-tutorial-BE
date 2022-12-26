import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, Matches, MinLength } from 'class-validator'
import { Match } from 'decorators/match-decorator'

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  first_name?: string

  @ApiProperty()
  @IsOptional()
  last_name?: string

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  refresh_token?: string | null

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  reset_token?: string | null

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  email_token?: string | null

  @ApiProperty({ required: false })
  @IsOptional()
  email_verified?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @MinLength(6)
  @Matches(/^(?=.*\d)[A-Za-z.\s_-]+[\w~@#$%^&*+=`|{}:;!.?"()[\]-]{6,}/)
  password?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @MinLength(6)
  @Matches(
    /^(?=.*[0-9])(?=.*[!@#"'$=%^&*(),._|<>{}€+?\-\\])(?=.*?[A-Z])(?=.*?[a-z])[a-zA-Z0-9!@#"'$=%^&*(),._|<>{}€+?\-\\]{6,16}$/,
  )
  new_password?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Match(UpdateUserDto, (s) => s.new_password, { message: 'New passwords do not match.' })
  confirm_password?: string
}
