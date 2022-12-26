import { Injectable } from '@nestjs/common'
import { BadRequestException, InternalServerErrorException } from '@nestjs/common/exceptions'
import { InjectRepository } from '@nestjs/typeorm'
import { Article } from 'entities/article.entity'
import { User } from 'entities/user.entity'
import { PropertyTypes } from 'interfaces/user.interface'
import Logging from 'library/Logging'
import { MenusService } from 'modules/menus/menus.service'
import { Repository } from 'typeorm'

import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article.dto'

@Injectable()
export class ArticlesService {
  constructor(
    private menusService: MenusService,
    @InjectRepository(Article) private articlesRepository: Repository<Article>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Article[]> {
    try {
      return this.articlesRepository.find({ relations: ['article_category', 'menu'] })
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for list of articles.')
    }
  }

  async findBy(property: string, value: PropertyTypes): Promise<Article> {
    try {
      return this.articlesRepository.findOne({
        select: ['id', 'name', 'article_category', 'menu', 'created_at', 'updated_at'],
        relations: ['article_category', 'menu'],
        where: { [property]: value },
      })
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException(`Cannot find article with ${property}: ${value}.`)
    }
  }

  async findById(id: string): Promise<Article> {
    try {
      const article = await this.articlesRepository.findOne({
        select: ['id', 'name', 'article_category', 'menu', 'created_at', 'updated_at'],
        relations: ['article_category', 'menu'],
        where: { id },
      })
      if (!article) {
        throw new BadRequestException(`Cannot find article with id: ${id}`)
      }
      return article
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException(`Something went wrong while searching for a article with id: ${id}`)
    }
  }

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    console.log(createArticleDto)
    const article = this.articlesRepository.create(createArticleDto)
    console.log(article)
    return this.articlesRepository.save(article)
  }

  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    console.log(updateArticleDto)
    const article = await this.findById(id)
    console.log(article)
    return article
  }

  async remove(id: string): Promise<Article> {
    const article = await this.findById(id)
    try {
      return this.articlesRepository.remove(article)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while deleting a article.')
    }
  }
}
