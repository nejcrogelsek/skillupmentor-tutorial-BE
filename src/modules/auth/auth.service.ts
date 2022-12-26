import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import sgMail from '@sendgrid/mail'
import { User } from 'entities/user.entity'
import { Request, Response } from 'express'
import { compareHash, hash } from 'helpers/bcrypt'
import { PostgresErrorCode } from 'helpers/postgresErrorCodes.enum'
import { CookieType, JwtType, TokenPayload, UserData, UserReturnData } from 'interfaces'
import Logging from 'library/Logging'
import { UsersService } from 'modules/users/users.service'

import { RegisterUserDto } from './dto/register-user.dto'

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    sgMail.setApiKey(configService.get('SENDGRID_API_KEY'))
  }

  async validateUser(email: string, password: string): Promise<User> {
    Logging.log('Validating user...')
    const user = await this.usersService.findBy('email', email)
    if (!user) {
      throw new BadRequestException('Invalid credentials.')
    }
    if (!(await compareHash(password, user.password))) {
      throw new BadRequestException('Invalid credentials.')
    }

    Logging.log('User is valid.')
    return user
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const hashedPassword: string = await hash(registerUserDto.password)
    const user = await this.usersService.create({
      ...registerUserDto,
      password: hashedPassword,
    })
    return user
  }

  async login(user: User, res: Response): Promise<void> {
    const accessToken = await this.generateToken(user.id, user.email, JwtType.ACCESS_TOKEN)
    const accessTokenCookie = await this.generateCookie(accessToken, CookieType.ACCESS_TOKEN)
    const refreshToken = await this.generateToken(user.id, user.email, JwtType.REFRESH_TOKEN)
    const refreshTokenCookie = await this.generateCookie(refreshToken, CookieType.REFRESH_TOKEN)
    try {
      res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie])
      await this.updateRtHash(user.id, refreshToken)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while setting cookies into response header.')
    }
    const newUser = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      access: user.access,
      email: user.email,
      email_verified: user.email_verified,
    }
    try {
      res.status(200).send(newUser)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while sending a response to the client side.')
    }
  }

  async signout(userId: string, res: Response): Promise<void> {
    const user = await this.usersService.findById(userId)
    await this.usersService.update(user.id, { refresh_token: null })
    try {
      res.setHeader('Set-Cookie', this.getCookiesForSignOut()).sendStatus(200)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while setting cookies into response header.')
    }
  }

  async refreshTokens(req: Request): Promise<UserReturnData> {
    const user = await this.usersService.findBy('refresh_token', req.cookies.refresh_token)
    if (!user) {
      throw new ForbiddenException()
    }
    try {
      await this.jwtService.verifyAsync(user.refresh_token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      })
    } catch (error) {
      Logging.error(error)
      throw new UnauthorizedException('Something went wrong while refreshing tokens.')
    }
    const token = await this.generateToken(user.id, user.email, JwtType.ACCESS_TOKEN)
    const cookie = await this.generateCookie(token, CookieType.ACCESS_TOKEN)

    try {
      req.res.setHeader('Set-Cookie', cookie)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while setting cookies into response header.')
    }
    return {
      id: user.id,
      email: user.email,
      email_verified: user.email_verified,
    }
  }

  async updateRtHash(userId: string, rt: string): Promise<void> {
    try {
      await this.usersService.update(userId, { refresh_token: rt })
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while updating refresh token.')
    }
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<UserData> {
    const user = await this.usersService.findById(userId)
    const isRefreshTokenMatching = await compareHash(refreshToken, user.refresh_token)
    if (isRefreshTokenMatching) {
      return {
        id: user.id,
        email: user.email,
      }
    }
  }

  async generateToken(userId: string, email: string, type: JwtType): Promise<string> {
    try {
      const payload: TokenPayload = { sub: userId, name: email, type }
      let token: string
      switch (type) {
        case 'EMAIL_VERIFICATION':
          token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_EMAIL_VERIFICATION_SECRET'),
            expiresIn: `${this.configService.get('JWT_EMAIL_VERIFICATION_EXPIRES')}s`,
          })
          break
        case 'REFRESH_TOKEN':
          token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: `${this.configService.get('JWT_REFRESH_SECRET_EXPIRES')}s`,
          })
          break
        case 'ACCESS_TOKEN':
          token = await this.jwtService.signAsync(payload)
          break
        default:
          throw new BadRequestException('Permission denied.')
      }
      return token
    } catch (error) {
      Logging.error(error)
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with that email already exists.')
      }
      throw new InternalServerErrorException('Something went wrong while generating a new token.')
    }
  }

  async generateCookie(token: string, type: CookieType): Promise<string> {
    try {
      let cookie: string
      switch (type) {
        case 'REFRESH_TOKEN':
          cookie = `refresh_token=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
          )}; SameSite=strict`
          break
        case 'ACCESS_TOKEN':
          cookie = `access_token=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
            'JWT_EXPIRATION_TIME',
          )}; SameSite=strict`
          break
        default:
          throw new BadRequestException('Permission denied.')
      }
      return cookie
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while generating a new cookie.')
    }
  }

  getCookiesForSignOut(): string[] {
    return ['access_token=; HttpOnly; Path=/; Max-Age=0', 'refresh_token=; HttpOnly; Path=/; Max-Age=0']
  }
}
