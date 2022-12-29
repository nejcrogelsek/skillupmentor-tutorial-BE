import { IsNotEmpty } from 'class-validator'

export class CreateOrderDto {
  @IsNotEmpty()
  first_name: string

  @IsNotEmpty()
  last_name: string

  @IsNotEmpty()
  email: string
}
