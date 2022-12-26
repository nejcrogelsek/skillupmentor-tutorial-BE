import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Location } from 'entities/location.entity'
import { Menu } from 'entities/menu.entity'
import { User } from 'entities/user.entity'

import { MenusController } from './menus.controller'
import { MenusService } from './menus.service'

@Module({
  imports: [TypeOrmModule.forFeature([Menu, User, Location])],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
