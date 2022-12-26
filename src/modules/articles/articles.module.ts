import { Module } from '@nestjs/common'
import { forwardRef } from '@nestjs/common/utils/forward-ref.util'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Article } from 'entities/article.entity'
import { User } from 'entities/user.entity'
import { MenusModule } from 'modules/menus/menus.module'

import { ArticlesController } from './articles.controller'
import { ArticlesService } from './articles.service'

@Module({
  imports: [TypeOrmModule.forFeature([Article, User]), forwardRef(() => MenusModule)],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
