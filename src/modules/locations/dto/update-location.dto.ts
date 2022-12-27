import { IsNotEmpty } from 'class-validator'
import { UpdateMenuDto } from 'modules/menus/dto/update-menu.dto'

export class UpdateLocationDto extends UpdateMenuDto {
  @IsNotEmpty()
  name: string
}
