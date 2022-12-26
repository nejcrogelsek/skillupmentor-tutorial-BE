import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, ManyToOne } from 'typeorm'

import { Base } from './base.entity'
import { Menu } from './menu.entity'

@Entity()
export class ArticleCategory extends Base {
  @ApiProperty()
  @Column()
  name: string

  @ManyToOne(() => Menu, (menu) => menu.article_category, { onDelete: 'CASCADE' })
  menu: Menu
}
