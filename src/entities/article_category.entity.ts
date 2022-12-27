import { Column, Entity, ManyToOne } from 'typeorm'

import { Base } from './base.entity'
import { Menu } from './menu.entity'

@Entity()
export class ArticleCategory extends Base {
  @Column()
  name: string

  @ManyToOne(() => Menu, (menu) => menu.article_category, { onDelete: 'CASCADE' })
  menu: Menu
}
