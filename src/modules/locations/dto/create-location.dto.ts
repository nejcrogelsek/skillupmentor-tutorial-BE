import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CreateMenuDto } from 'modules/menus/dto/create-menu.dto'

export class CreateLocationDto extends CreateMenuDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string
}
