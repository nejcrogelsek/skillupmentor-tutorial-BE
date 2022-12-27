import { IsEmail, IsOptional, Matches, MinLength } from 'class-validator'
import { Match } from 'decorators/match-decorator'

export class UpdateUserDto {
  @IsOptional()
  first_name?: string

  @IsOptional()
  last_name?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsOptional()
  refresh_token?: string | null

  @IsOptional()
  @MinLength(6)
  @Matches(/^(?=.*\d)[A-Za-z.\s_-]+[\w~@#$%^&*+=`|{}:;!.?"()[\]-]{6,}/)
  password?: string

  @IsOptional()
  @MinLength(6)
  @Matches(
    /^(?=.*[0-9])(?=.*[!@#"'$=%^&*(),._|<>{}€+?\-\\])(?=.*?[A-Z])(?=.*?[a-z])[a-zA-Z0-9!@#"'$=%^&*(),._|<>{}€+?\-\\]{6,16}$/,
  )
  new_password?: string

  @IsOptional()
  @Match(UpdateUserDto, (s) => s.new_password, { message: 'New passwords do not match.' })
  confirm_password?: string
}
