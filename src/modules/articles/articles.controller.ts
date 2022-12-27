import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'
import { HttpStatus } from '@nestjs/common/enums'
import { Article } from 'entities/article.entity'

import { ArticlesService } from './articles.service'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article.dto'

@Controller('articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Article[]> {
    return this.articlesService.findAll()
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Article> {
    return this.articlesService.findById(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateArticleDto): Promise<Article> {
    return this.articlesService.create(body)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateUserDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Article> {
    return this.articlesService.remove(id)
  }
}
