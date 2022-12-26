import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm'

import { Article } from './article.entity'
import { ArticleCategory } from './article_category.entity'
import { Base } from './base.entity'
import { Location } from './location.entity'

@Entity()
export class Menu extends Base {
  @ApiProperty()
  @Column()
  logo: string

  @ApiProperty()
  @Column()
  primary_color: string

  @ApiProperty()
  @Column()
  secondary_color: string

  @ApiProperty()
  @Column()
  facebook_link: string

  @ApiProperty()
  @Column()
  instagram_link: string

  @ApiProperty({ isArray: true })
  @OneToMany(() => Article, (article) => article.menu)
  articles: Article[]

  @ApiProperty({ isArray: true })
  @OneToMany(() => ArticleCategory, (articleCategory) => articleCategory.menu)
  article_category: ArticleCategory[]

  @OneToOne(() => Location, (location) => location.menu, { onDelete: 'CASCADE' })
  @JoinColumn()
  location: Location
}
