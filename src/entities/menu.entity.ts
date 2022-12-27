import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm'

import { Article } from './article.entity'
import { ArticleCategory } from './article_category.entity'
import { Base } from './base.entity'
import { Location } from './location.entity'

@Entity()
export class Menu extends Base {
  @Column()
  logo: string

  @Column()
  primary_color: string

  @Column()
  secondary_color: string

  @Column()
  facebook_link: string

  @Column()
  instagram_link: string

  @OneToMany(() => Article, (article) => article.menu)
  articles: Article[]

  @OneToMany(() => ArticleCategory, (articleCategory) => articleCategory.menu)
  article_category: ArticleCategory[]

  @OneToOne(() => Location, (location) => location.menu, { onDelete: 'CASCADE' })
  @JoinColumn()
  location: Location
}
