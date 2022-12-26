import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'

import { Base } from './base.entity'
import { Menu } from './menu.entity'
import { User } from './user.entity'

@Entity()
export class Location extends Base {
  @ApiProperty()
  @Column()
  name: string

  @ApiProperty()
  @Column()
  slug: string

  @ManyToOne(() => User, (user) => user.locations, { onDelete: 'CASCADE' })
  user: User

  @OneToOne(() => Menu, (menu) => menu.location, { eager: true })
  menu: Menu
}
