import { Injectable } from '@nestjs/common'
import { BadRequestException, InternalServerErrorException } from '@nestjs/common/exceptions'
import { InjectRepository } from '@nestjs/typeorm'
import { Location } from 'entities/location.entity'
import { Menu } from 'entities/menu.entity'
import { User } from 'entities/user.entity'
import { PropertyTypes } from 'interfaces/user.interface'
import Logging from 'library/Logging'
import { Repository } from 'typeorm'

import { CreateMenuDto } from './dto/create-menu.dto'
import { UpdateMenuDto } from './dto/update-menu.dto'

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu) private locationsRepository: Repository<Location>,
    @InjectRepository(Menu) private menusRepository: Repository<Menu>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Menu[]> {
    try {
      return this.menusRepository.find({ relations: ['location', 'articles', 'article_category'] })
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for list of menus.')
    }
  }

  async findBy(property: string, value: PropertyTypes): Promise<Menu> {
    try {
      return this.menusRepository.findOne({
        select: [
          'id',
          'logo',
          'primary_color',
          'secondary_color',
          'facebook_link',
          'instagram_link',
          'articles',
          'article_category',
          'location',
          'created_at',
          'updated_at',
        ],
        relations: ['location', 'articles', 'article_category'],
        where: { [property]: value },
      })
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException(`Cannot find user with ${property}: ${value}.`)
    }
  }

  async findById(id: string): Promise<Menu> {
    try {
      const menu = this.menusRepository.findOne({
        select: [
          'id',
          'logo',
          'primary_color',
          'secondary_color',
          'facebook_link',
          'instagram_link',
          'articles',
          'article_category',
          'location',
          'created_at',
          'updated_at',
        ],
        relations: ['location', 'articles', 'article_category'],
        where: { id },
      })
      if (!menu) {
        throw new BadRequestException(`Cannot find menu with id: ${id}`)
      }
      return menu
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException(`Something went wrong while searching for a menu with id: ${id}`)
    }
  }

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    try {
      return this.menusRepository.save(this.menusRepository.create({ ...createMenuDto }))
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while creating a new menu.')
    }
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menusRepository.findOne({ relations: ['articles', 'article_category'], where: { id } })
    if (!menu) {
      throw new BadRequestException(`Cannot find menu with id: ${id}`)
    }
    try {
      Object.entries(updateMenuDto).map((entry) => {
        menu[entry[0]] = entry[1]
      })
      return this.menusRepository.save(menu)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while updating the menu.')
    }
  }

  async remove(id: string): Promise<Menu> {
    const menu = await this.findById(id)
    try {
      return this.menusRepository.remove(menu)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while deleting a menu.')
    }
  }

  async removeAll(): Promise<void> {
    const menus = await this.findAll()
    try {
      menus.forEach(async (menu) => {
        await this.menusRepository.remove(menu)
      })
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while deleting the menu.')
    }
  }
}
