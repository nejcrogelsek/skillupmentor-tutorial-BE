import { Body, Controller, Delete, Get, HttpCode, Param, Patch } from '@nestjs/common'
import { HttpStatus } from '@nestjs/common/enums'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { Menu } from 'entities/menu.entity'

import { UpdateMenuDto } from './dto/update-menu.dto'
import { MenusService } from './menus.service'

@ApiTags('Menus')
@Controller('menus')
export class MenusController {
  constructor(private menusService: MenusService) {}

  @ApiCreatedResponse({ description: 'List all menus.' })
  @ApiBadRequestResponse()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Menu[]> {
    return this.menusService.findAll()
  }

  @ApiCreatedResponse({ description: 'Returns menu based on id.' })
  @ApiBadRequestResponse()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Menu> {
    return this.menusService.findById(id)
  }

  @ApiCreatedResponse({ description: 'Update menu.' })
  @ApiBadRequestResponse()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateMenuDto) {
    return this.menusService.update(id, updateUserDto)
  }

  @ApiCreatedResponse({ description: 'Delete menu based on id.' })
  @ApiBadRequestResponse()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Menu> {
    return this.menusService.remove(id)
  }

  // For development purposes
  @ApiCreatedResponse({ description: 'Delete all menus.' })
  @ApiBadRequestResponse()
  @Delete()
  @HttpCode(HttpStatus.OK)
  async removeAll(): Promise<void> {
    return this.menusService.removeAll()
  }
}
