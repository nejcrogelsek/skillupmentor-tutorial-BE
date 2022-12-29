import { NestModule } from '@nestjs/common'
import { MiddlewareConsumer } from '@nestjs/common'
import { RequestMethod } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { configValidationSchema } from 'config/schema.config'
import { LoggerMiddleware } from 'middleware/logger.middleware'

import { AuthModule } from './auth/auth.module'
import { JwtAuthGuard } from './auth/guards'
import { DatabaseModule } from './database/database.module'
import { RolesModule } from './roles/roles.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    UsersModule,
    DatabaseModule,
    AuthModule,
    RolesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
