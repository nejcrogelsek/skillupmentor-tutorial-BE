import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { GetCurrentUser, GetCurrentUserId, Public } from 'decorators'
import { User } from 'entities/user.entity'
import { Request, Response } from 'express'
import { RequestWithUser, UserData } from 'interfaces'

import { AuthService } from './auth.service'
import { RegisterUserDto } from './dto/register-user.dto'
import { JwtAuthGuard, JwtRefreshAuthGuard, LocalAuthGuard } from './guards'

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterUserDto): Promise<User> {
    return this.authService.register(body)
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Req() req: RequestWithUser, @Res() res: Response): Promise<void> {
    return this.authService.login(req.user, res)
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('signout')
  async signout(@GetCurrentUserId() userId: string, @Res() res: Response): Promise<void> {
    return this.authService.signout(userId, res)
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  async refreshTokens(@Req() req: Request): Promise<User> {
    return this.authService.refreshTokens(req)
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getCurrentUser(@GetCurrentUser() user: User): Promise<UserData> {
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      avatar: user.avatar,
      role: { id: user.role.id, name: user.role.name },
    }
  }
}
