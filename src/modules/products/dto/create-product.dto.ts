import { IsNotEmpty } from 'class-validator'

export class CreateUpdateProductDto {
  @IsNotEmpty()
  title: string

  @IsNotEmpty()
  description: string

  @IsNotEmpty()
  price: string
}
