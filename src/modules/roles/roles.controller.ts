import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common'
import { Role } from 'entities/role.entity'

import { CreateUpdateRoleDto } from './dto/create-update-role.dto'
import { RolesService } from './roles.service'

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Role[]> {
    return this.rolesService.findAll()
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoleDto: CreateUpdateRoleDto): Promise<Role> {
    return this.rolesService.create(createRoleDto)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateRoleDto: CreateUpdateRoleDto): Promise<Role> {
    return this.rolesService.update(id, updateRoleDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Role> {
    return this.rolesService.remove(id)
  }
}
