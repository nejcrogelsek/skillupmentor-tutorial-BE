import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from 'class-validator'
import { Match } from 'decorators/match-decorator'

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  first_name?: string

  @ApiProperty()
  @IsOptional()
  last_name?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*\d)[A-Za-z.\s_-]+[\w~@#$%^&*+=`|{}:;!.?"()[\]-]{6,}/)
  password: string

  @ApiProperty()
  @IsNotEmpty()
  @Match(CreateUserDto, (field) => field.password)
  confirm_password: string
}
