import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'
import { HttpStatus } from '@nestjs/common/enums'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { GetCurrentUserId } from 'decorators'
import { Location } from 'entities/location.entity'

import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { LocationsService } from './locations.service'

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @ApiCreatedResponse({ description: 'List all locations.' })
  @ApiBadRequestResponse()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Location[]> {
    return this.locationsService.findAll()
  }

  @ApiCreatedResponse({ description: 'Returns location based on id.' })
  @ApiBadRequestResponse()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Location> {
    return this.locationsService.findById(id)
  }

  @ApiCreatedResponse({ description: 'Returns location based on slug (name).' })
  @ApiBadRequestResponse()
  @Get('/slug/:slug')
  @HttpCode(HttpStatus.OK)
  async findOneBySlug(@Param('slug') slug: string): Promise<Location> {
    return this.locationsService.findOneBySlug(slug)
  }

  @ApiCreatedResponse({ description: 'Create new location.' })
  @ApiBadRequestResponse()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@GetCurrentUserId() userId: string, @Body() body: CreateLocationDto): Promise<Location> {
    return this.locationsService.create(userId, body)
  }

  @ApiCreatedResponse({ description: 'Update location.' })
  @ApiBadRequestResponse()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateLocationDto) {
    return this.locationsService.update(id, updateUserDto)
  }

  @ApiCreatedResponse({ description: 'Delete location based on id.' })
  @ApiBadRequestResponse()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Location> {
    return this.locationsService.remove(id)
  }

  // For development purposes
  @ApiCreatedResponse({ description: 'Delete all locations.' })
  @ApiBadRequestResponse()
  @Delete()
  @HttpCode(HttpStatus.OK)
  async removeAll(): Promise<void> {
    return this.locationsService.removeAll()
  }
}
