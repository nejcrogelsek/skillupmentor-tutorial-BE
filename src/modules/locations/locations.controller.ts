import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'
import { HttpStatus } from '@nestjs/common/enums'
import { GetCurrentUserId } from 'decorators'
import { Location } from 'entities/location.entity'

import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { LocationsService } from './locations.service'

@Controller('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Location[]> {
    return this.locationsService.findAll()
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Location> {
    return this.locationsService.findById(id)
  }

  @Get('/slug/:slug')
  @HttpCode(HttpStatus.OK)
  async findOneBySlug(@Param('slug') slug: string): Promise<Location> {
    return this.locationsService.findOneBySlug(slug)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@GetCurrentUserId() userId: string, @Body() body: CreateLocationDto): Promise<Location> {
    return this.locationsService.create(userId, body)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateLocationDto) {
    return this.locationsService.update(id, updateUserDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Location> {
    return this.locationsService.remove(id)
  }
}
