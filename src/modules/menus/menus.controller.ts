import { Body, Controller, Delete, Get, HttpCode, Param, Patch } from '@nestjs/common'
import { HttpStatus } from '@nestjs/common/enums'
import { Menu } from 'entities/menu.entity'

import { UpdateMenuDto } from './dto/update-menu.dto'
import { MenusService } from './menus.service'

@Controller('menus')
export class MenusController {
  constructor(private menusService: MenusService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Menu[]> {
    return this.menusService.findAll()
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Menu> {
    return this.menusService.findById(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateMenuDto) {
    return this.menusService.update(id, updateUserDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Menu> {
    return this.menusService.remove(id)
  }
}
