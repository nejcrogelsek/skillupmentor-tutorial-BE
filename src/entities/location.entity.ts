import { Column, Entity, ManyToOne, OneToOne } from 'typeorm'

import { Base } from './base.entity'
import { Menu } from './menu.entity'
import { User } from './user.entity'

@Entity()
export class Location extends Base {
  @Column()
  name: string

  @Column()
  slug: string

  @ManyToOne(() => User, (user) => user.locations, { onDelete: 'CASCADE' })
  user: User

  @OneToOne(() => Menu, (menu) => menu.location, { eager: true })
  menu: Menu
}
