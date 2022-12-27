import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'

import { ArticleCategory } from './article_category.entity'
import { Base } from './base.entity'
import { Menu } from './menu.entity'

@Entity()
export class Article extends Base {
  @Column()
  name: string

  @Column()
  price: string

  @Column()
  description: string

  @Column()
  quantity: string

  @Column()
  logo: string

  @Column({ default: false })
  show_description: boolean

  @Column({ default: false })
  show_on_menu: boolean

  @Column({ default: false })
  take_into_account_when_listing: boolean

  @Column({ default: false })
  notify_when_stock_is_low: boolean

  @OneToOne(() => ArticleCategory)
  @JoinColumn()
  article_category: ArticleCategory

  @ManyToOne(() => Menu, (menu) => menu.articles, { onDelete: 'CASCADE' })
  menu: Menu
}
