import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from 'class-validator'
import { Match } from 'decorators/match-decorator'

export class CreateUserDto {
  @IsOptional()
  first_name?: string

  @IsOptional()
  last_name?: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*\d)[A-Za-z.\s_-]+[\w~@#$%^&*+=`|{}:;!.?"()[\]-]{6,}/)
  password: string

  @IsNotEmpty()
  @Match(CreateUserDto, (field) => field.password)
  confirm_password: string
}
