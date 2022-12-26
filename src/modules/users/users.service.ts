import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'entities/user.entity'
import { compareHash, hash } from 'helpers/bcrypt'
import { sendMail } from 'helpers/mail'
import { PostgresErrorCode } from 'helpers/postgresErrorCodes.enum'
import { JwtType, PropertyTypes } from 'interfaces'
import Logging from 'library/Logging'
import { AuthService } from 'modules/auth/auth.service'
import { Repository } from 'typeorm'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  async findAll(): Promise<User[]> {
    try {
      return this.usersRepository.find({ relations: ['locations'] })
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for list of users.')
    }
  }

  async findBy(property: string, value: PropertyTypes): Promise<User> {
    try {
      return this.usersRepository.findOne({
        select: [
          'id',
          'email',
          'password',
          'email_verified',
          'email_token',
          'refresh_token',
          'locations',
          'created_at',
          'updated_at',
        ],
        relations: ['locations'],
        where: { [property]: value },
      })
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException(`Cannot find user with ${property}: ${value}.`)
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = this.usersRepository.findOne({
        select: [
          'id',
          'email',
          'password',
          'email_verified',
          'email_token',
          'refresh_token',
          'locations',
          'created_at',
          'updated_at',
        ],
        relations: ['locations'],
        where: { id },
      })
      if (!user) {
        throw new BadRequestException(`Cannot find user with id: ${id}`)
      }
      return user
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException(`Something went wrong while searching for a user with id: ${id}`)
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = this.usersRepository.create(createUserDto)
      return this.usersRepository.save(newUser)
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('Something went wrong while creating a new user.')
    }
  }

  async verifyUser(email_token: string): Promise<User | string> {
    const user = await this.findBy('email_token', email_token)
    if (!user) {
      throw new UnauthorizedException('Token is invalid. Please contact us for assistance.')
    }
    return this.update(user.id, { email_token: null, email_verified: true })
  }

  async updateEmail(user: User, email: string) {
    try {
      await this.usersRepository.save({ ...user, email: email })
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('Something went wrong while updating the user email.')
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | string> {
    const user = await this.findById(id)
    const { email, password: current_password, new_password, confirm_password, ...data } = updateUserDto
    if (user.email !== email && email) {
      user.email = email
      user.email_verified = false
      if (process.env.STAGE === 'development') {
        const token = await this.authService.generateToken(user.id, user.email, JwtType.EMAIL_VERIFICATION)
        await this.update(user.id, { email_token: token })
        await sendMail({
          from: {
            name: 'E-Gostinec',
            email: this.configService.get('SENDGRID_EMAIL_FROM'),
          },
          to: user.email,
          subject: 'E-Gostinec - verify your email',
          text: `
           Hello ${updateUserDto.email},
           Read this email only if you requested to change your email address.
           Please click or copy and paste the address below to verify your account.
           ${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}
        `,
          html: `
          <h1>Hello ${updateUserDto.email},</h1>
          <p>Read this email only if you requested to change your email address.</p>
          <p>Please click the link below to verify your account.</p>
          <a href='${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}&email=${
            updateUserDto.email
          }'>Verify your account</a>
        `,
        })
        return 'Check your inbox and verify your account, to start using all services.'
      }
    }
    if (current_password && new_password && confirm_password) {
      if (!(await compareHash(current_password, user.password))) {
        throw new BadRequestException('Current password is incorrect.')
      }
      if (current_password === new_password) {
        throw new BadRequestException('New password cannot be the same as your old password.')
      }
      user.password = await hash(new_password)
    } else if (new_password && confirm_password) {
      if (new_password !== confirm_password) {
        throw new BadRequestException('Passwords do not match.')
      }
      if (await compareHash(new_password, user.password)) {
        throw new BadRequestException('New password cannot be the same as your old password.')
      }
      user.password = await hash(new_password)
    }
    try {
      Object.entries(data).map((entry) => {
        user[entry[0]] = entry[1]
      })
      return this.usersRepository.save(user)
    } catch (error) {
      Logging.error(error)
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with that email already exists')
      }
      throw new InternalServerErrorException('Something went wrong while updating the user.')
    }
  }

  async remove(id: string): Promise<User> {
    const user = await this.findById(id)
    try {
      return this.usersRepository.remove(user)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while deleting the user.')
    }
  }
}
