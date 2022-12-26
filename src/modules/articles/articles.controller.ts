import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'
import { HttpStatus } from '@nestjs/common/enums'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { Article } from 'entities/article.entity'

import { ArticlesService } from './articles.service'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article.dto'

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @ApiCreatedResponse({ description: 'List all locations.' })
  @ApiBadRequestResponse()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Article[]> {
    return this.articlesService.findAll()
  }

  @ApiCreatedResponse({ description: 'Returns location based on id.' })
  @ApiBadRequestResponse()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Article> {
    return this.articlesService.findById(id)
  }

  @ApiCreatedResponse({ description: 'Create new article.' })
  @ApiBadRequestResponse()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateArticleDto): Promise<Article> {
    return this.articlesService.create(body)
  }

  @ApiCreatedResponse({ description: 'Update article.' })
  @ApiBadRequestResponse()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateUserDto)
  }

  @ApiCreatedResponse({ description: 'Delete location based on id.' })
  @ApiBadRequestResponse()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Article> {
    return this.articlesService.remove(id)
  }
}
