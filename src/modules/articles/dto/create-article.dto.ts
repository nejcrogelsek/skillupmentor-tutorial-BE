import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, Matches } from 'class-validator'

export class CreateArticleDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/\+?(\d+(\.(\d+)?)?|,\d+)/)
  price: string

  @ApiProperty()
  @IsOptional()
  description: string

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/(\+?\d+\,?\d{0,2})/)
  quantity: string

  @ApiProperty()
  @IsNotEmpty()
  logo: string

  @ApiProperty({ default: false })
  @IsNotEmpty()
  show_description: boolean

  @ApiProperty({ default: false })
  @IsOptional()
  show_on_menu: boolean

  @ApiProperty({ default: false })
  @IsOptional()
  take_into_account_when_listing: boolean

  @ApiProperty({ default: false })
  @IsOptional()
  notify_when_stock_is_low: boolean
}
