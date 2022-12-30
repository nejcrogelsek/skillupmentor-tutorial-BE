import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { HasPermission } from 'decorators/has-permission.decorator'
import { Permission } from 'entities/permission.entity'

import { CreatePermissionDto } from './dto/create-permission.dto'
import { PermissionsService } from './permissions.service'

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  // @HasPermission('view_permissions')
  async findAll(): Promise<Permission[]> {
    return this.permissionsService.findAll()
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.permissionsService.create(createPermissionDto)
  }
}
