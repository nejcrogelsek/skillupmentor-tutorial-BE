import { Module } from '@nestjs/common'
import { forwardRef } from '@nestjs/common/utils/forward-ref.util'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Location } from 'entities/location.entity'
import { User } from 'entities/user.entity'
import { MenusModule } from 'modules/menus/menus.module'

import { LocationsController } from './locations.controller'
import { LocationsService } from './locations.service'

@Module({
  imports: [TypeOrmModule.forFeature([Location, User]), forwardRef(() => MenusModule)],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
