import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { UserAccess } from 'interfaces/user.interface'
import { Column, Entity, OneToMany } from 'typeorm'

import { Base } from './base.entity'
import { Location } from './location.entity'

@Entity()
export class User extends Base {
  @ApiProperty({ uniqueItems: true })
  @Column({ unique: true })
  email: string

  @ApiProperty()
  @Column({ nullable: true })
  first_name: string

  @ApiProperty()
  @Column({ nullable: true })
  last_name: string

  @ApiProperty()
  @Column({ default: UserAccess.USER })
  access: UserAccess

  @ApiProperty()
  @Column({ nullable: true })
  @Exclude()
  password: string

  @ApiProperty({ required: false, nullable: true })
  @Column({ nullable: true, default: null })
  email_token: string

  @ApiProperty()
  @Column({ default: false })
  email_verified: boolean

  @ApiProperty({ required: false, nullable: true })
  @Column({ nullable: true, default: null })
  @Exclude()
  refresh_token: string

  @ApiProperty({ required: false, nullable: true })
  @Column({ nullable: true, default: null })
  reset_token: string

  @ApiProperty({ isArray: true })
  @OneToMany(() => Location, (location) => location.user)
  locations: Location[]
}
