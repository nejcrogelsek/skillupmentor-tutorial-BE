import { IsNotEmpty } from 'class-validator'
import { CreateMenuDto } from 'modules/menus/dto/create-menu.dto'

export class CreateLocationDto extends CreateMenuDto {
  @IsNotEmpty()
  name: string
}
