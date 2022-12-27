import { IsNotEmpty, IsOptional, Matches } from 'class-validator'

export class CreateArticleDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  @Matches(/\+?(\d+(\.(\d+)?)?|,\d+)/)
  price: string

  @IsOptional()
  description: string

  @IsNotEmpty()
  @Matches(/(\+?\d+\,?\d{0,2})/)
  quantity: string

  @IsNotEmpty()
  logo: string

  @IsNotEmpty()
  show_description: boolean

  @IsOptional()
  show_on_menu: boolean

  @IsOptional()
  take_into_account_when_listing: boolean

  @IsOptional()
  notify_when_stock_is_low: boolean
}
