import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'

export class CreateMenuDto {
  @ApiProperty()
  @IsNotEmpty()
  logo: string

  @ApiProperty()
  @IsNotEmpty()
  primary_color: string

  @ApiProperty()
  @IsNotEmpty()
  secondary_color: string

  @ApiProperty()
  @IsOptional()
  facebook_link: string

  @ApiProperty()
  @IsOptional()
  instagram_link: string
}
