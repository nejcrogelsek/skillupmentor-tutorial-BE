import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { UpdateMenuDto } from 'modules/menus/dto/update-menu.dto'

export class UpdateLocationDto extends UpdateMenuDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string
}
