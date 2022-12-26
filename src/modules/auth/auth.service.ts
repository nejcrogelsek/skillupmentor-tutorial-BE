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
import { sendMail } from 'helpers/mail'
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

  async register(res: Response, registerUserDto: RegisterUserDto): Promise<void> {
    const hashedPassword: string = await hash(registerUserDto.password)
    const user = await this.usersService.create({
      ...registerUserDto,
      password: hashedPassword,
    })
    if (process.env.STAGE === 'development') {
      const token = await this.generateToken(user.id, user.email, JwtType.EMAIL_VERIFICATION)
      await this.usersService.update(user.id, { email_token: token })
      await sendMail({
        from: {
          name: 'E-Gostinec',
          email: this.configService.get('SENDGRID_EMAIL_FROM'),
        },
        to: user.email,
        subject: 'E-Gostinec - verify your email',
        text: `
         Hello ${user.email},
         Thanks for registering on our site.
         Please click or copy and paste the address below to verify your account.
         ${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}
      `,
        html: `
        <h1>Hello ${user.email},</h1>
        <p>Thanks for registering on our site.</p>
        <p>Please click the link below to verify your account.</p>
        <a href='${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}'>Verify your account</a>
      `,
      })
      try {
        res.status(201).send('Check your inbox and verify your account, to start using all services.')
      } catch (error) {
        Logging.error(error)
        throw new InternalServerErrorException('Something went wrong while sending a response to the client side.')
      }
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const token = req.query.token.toString()
    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_EMAIL_VERIFICATION_SECRET'),
      })
    } catch (error) {
      Logging.error(error)
      if (error instanceof Error) {
        res.redirect(
          `${this.configService.get(
            'ON_ERROR_URL',
          )}?error="Unauthorized"&errorName="EMAIL_VERIFICATION"&errorCode=401&errorMessage="Your email verification link has expired."&description="To get valid verification link please click on 'Verify email' button below."&token="${token}"`,
        )
      }
    }
    const user = await this.usersService.verifyUser(token)
    if (req.query.email) {
      await this.usersService.updateEmail(user as User, req.query.email.toString())
    }
    try {
      res.redirect(
        `${this.configService.get(
          'ON_EMAIL_VERIFICATION_SUCCESS_URL',
        )}?message=Your account is verified. Now you can start using all services.`,
      )
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while sending a response to the client side.')
    }
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

  async resendEmailVerification(body: { token?: string; email?: string }, res: Response): Promise<void> {
    let user: User
    if (body.token) {
      user = await this.usersService.findBy('email_token', body.token)
    } else {
      user = await this.usersService.findBy('email', body.email)
    }
    if (!user) {
      throw new BadRequestException('User not found.')
    }
    if (user.email_verified) {
      throw new BadRequestException('Email already confirmed.')
    }
    if (process.env.STAGE === 'development') {
      const token = await this.generateToken(user.id, user.email, JwtType.EMAIL_VERIFICATION)
      await this.usersService.update(user.id, { email_token: token })
      await sendMail({
        from: {
          name: 'E-Gostinec',
          email: this.configService.get('SENDGRID_EMAIL_FROM'),
        },
        to: user.email,
        subject: 'E-Gostinec - verify your email',
        text: `
         Hello ${user.email},
         Thanks for registering on our site.
         Please click or copy and paste the address below to verify your account.
         ${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}
      `,
        html: `
        <h1>Hello ${user.email},</h1>
        <p>Thanks for registering on our site.</p>
        <p>Please click the link below to verify your account.</p>
        <a href='${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}'>Verify your account</a>
      `,
      })
      res.status(201).send('Check your inbox and verify your account, to start using all services.')
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
