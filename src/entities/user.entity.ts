import { Exclude } from 'class-transformer'
import { UserAccess } from 'interfaces/user.interface'
import { Column, Entity, OneToMany } from 'typeorm'

import { Base } from './base.entity'
import { Location } from './location.entity'

@Entity()
export class User extends Base {
  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  first_name: string

  @Column({ nullable: true })
  last_name: string

  @Column({ type: 'enum', enum: UserAccess, default: UserAccess.USER })
  access: UserAccess

  @Column({ nullable: true })
  image_path: string

  @Column({ nullable: true })
  @Exclude()
  password: string

  @Column({ nullable: true, default: null })
  @Exclude()
  refresh_token: string

  @OneToMany(() => Location, (location) => location.user)
  locations: Location[]
}
