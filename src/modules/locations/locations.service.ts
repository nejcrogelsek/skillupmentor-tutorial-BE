import { Injectable } from '@nestjs/common'
import { BadRequestException, InternalServerErrorException } from '@nestjs/common/exceptions'
import { InjectRepository } from '@nestjs/typeorm'
import { Location } from 'entities/location.entity'
import { User } from 'entities/user.entity'
import { PropertyTypes } from 'interfaces/user.interface'
import Logging from 'library/Logging'
import { MenusService } from 'modules/menus/menus.service'
import { Repository } from 'typeorm'

import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'

@Injectable()
export class LocationsService {
  constructor(
    private menusService: MenusService,
    @InjectRepository(Location) private locationsRepository: Repository<Location>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Location[]> {
    try {
      return this.locationsRepository.find({ relations: ['user', 'menu'] })
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for list of locations.')
    }
  }

  async findBy(property: string, value: PropertyTypes): Promise<Location> {
    try {
      return this.locationsRepository.findOne({
        select: ['id', 'name', 'user', 'menu', 'created_at', 'updated_at'],
        relations: ['user', 'menu'],
        where: { [property]: value },
      })
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException(`Cannot find location with ${property}: ${value}.`)
    }
  }

  async findById(id: string): Promise<Location> {
    try {
      const location = await this.locationsRepository.findOne({
        select: ['id', 'name', 'slug', 'user', 'menu', 'created_at', 'updated_at'],
        relations: ['user', 'menu'],
        where: { id },
      })
      if (!location) {
        throw new BadRequestException(`Cannot find location with id: ${id}`)
      }
      return location
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException(`Something went wrong while searching for a location with id: ${id}`)
    }
  }

  async findOneBySlug(slug: string): Promise<Location> {
    try {
      const location = await this.findBy('slug', slug)
      if (!location) {
        throw new BadRequestException('No locations were found.')
      }
      return location
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException(`Cannot find location with slug: ${slug}`)
    }
  }

  async create(userId: string, createLocationDto: CreateLocationDto): Promise<Location> {
    const { name, ...menuInfo } = createLocationDto
    const user = await this.usersRepository.findOne({
      relations: ['locations'],
      where: { id: userId },
    })
    if (!user) {
      throw new BadRequestException('No user found.')
    }
    // Check if name of location is unique
    user.locations.forEach((location) => {
      if (name === location.name) {
        throw new BadRequestException('Name of category must be unique value.')
      }
    })

    // Generate unique slug
    const generatedSlug = 'generated-slug'

    let location: Location
    try {
      location = this.locationsRepository.create({
        name,
        slug: generatedSlug,
        user,
      })
      user.locations.push(location)
      await this.usersRepository.save(user)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while creating a new location.')
    }
    // Create menu and set it to the location
    const menu = await this.menusService.create(menuInfo)
    location.menu = menu
    try {
      return this.locationsRepository.save(location)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while saving a new location.')
    }
  }

  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    const location = await this.findById(id)
    const { name, ...menuInfo } = updateLocationDto
    // Update the menu
    const menu = await this.menusService.update(location.menu.id, menuInfo)
    // Update the location
    // Generate unique slug
    const generatedSlug = 'generated-slug'
    try {
      if (name) {
        location.name = name
        location.slug = generatedSlug
      }
      location.menu = menu
      return this.locationsRepository.save(location)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while updating the location.')
    }
  }

  async remove(id: string): Promise<Location> {
    const location = await this.findById(id)
    try {
      return this.locationsRepository.remove(location)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while deleting a location.')
    }
  }

  async removeAll(): Promise<void> {
    const locations = await this.findAll()
    try {
      locations.forEach(async (location) => {
        await this.locationsRepository.remove(location)
      })
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while deleting the locations.')
    }
  }
}
