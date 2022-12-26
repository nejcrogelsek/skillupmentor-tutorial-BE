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
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { GetCurrentUser, GetCurrentUserId, Public } from 'decorators'
import { User } from 'entities/user.entity'
import { Request, Response } from 'express'
import { RequestWithUser, UserData } from 'interfaces'

import { AuthService } from './auth.service'
import { RegisterUserDto } from './dto/register-user.dto'
import { JwtAuthGuard, JwtRefreshAuthGuard, LocalAuthGuard } from './guards'

@ApiTags('Authentication')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiCreatedResponse({ description: 'Create new user.' })
  @ApiBadRequestResponse()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Res() res: Response, @Body() body: RegisterUserDto): Promise<void> {
    return this.authService.register(res, body)
  }

  @Public()
  @ApiCreatedResponse({ description: 'Verify email address.' })
  @ApiBadRequestResponse()
  @Get('verify-email')
  @HttpCode(HttpStatus.ACCEPTED)
  async verifyEmail(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.authService.verifyEmail(req, res)
  }

  @Public()
  @ApiCreatedResponse({ description: 'Sign in with email and password.' })
  @ApiBadRequestResponse()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Req() req: RequestWithUser, @Res() res: Response): Promise<void> {
    return this.authService.login(req.user, res)
  }

  @ApiCreatedResponse({ description: 'Signout user.' })
  @ApiBadRequestResponse()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('signout')
  async signout(@GetCurrentUserId() userId: string, @Res() res: Response): Promise<void> {
    return this.authService.signout(userId, res)
  }

  @Public()
  @ApiCreatedResponse({ description: 'Resend email verification link.' })
  @ApiBadRequestResponse()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('resend-email-verification')
  async resendEmailVerification(@Body() body: { token?: string; email?: string }, @Res() res: Response): Promise<void> {
    return this.authService.resendEmailVerification(body, res)
  }

  @Public()
  @ApiCreatedResponse({ description: 'Refresh tokens.' })
  @ApiBadRequestResponse()
  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  async refreshTokens(@Req() req: Request): Promise<UserData> {
    return this.authService.refreshTokens(req)
  }

  @ApiCreatedResponse({
    description: 'Returns user data if user is authenticated.',
  })
  @ApiBadRequestResponse()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getCurrentUser(@GetCurrentUser() user: User): Promise<{ id: string; email: string; email_verified?: boolean }> {
    return {
      id: user.id,
      email: user.email,
      email_verified: user.email_verified,
    }
  }
}
