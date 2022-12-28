import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'entities/user.entity'
import { PostgresErrorCode } from 'helpers/postgresErrorCodes.enum'
import { PropertyTypes } from 'interfaces'
import Logging from 'library/Logging'
import { Repository } from 'typeorm'
import { compareHash, hash } from 'utils/bcrypt'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async findAll(): Promise<User[]> {
    try {
      return this.usersRepository.find()
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for list of users.')
    }
  }

  async findBy(property: string, value: PropertyTypes): Promise<User> {
    try {
      return this.usersRepository.findOne({
        where: { [property]: value },
      })
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException(`Something went wrong while searching for a user with ${property}: ${value}.`)
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = this.usersRepository.findOne({
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
    const user = await this.findBy('email', createUserDto.email)
    if (user) {
      throw new BadRequestException('User with that email already exists.')
    }
    try {
      const newUser = this.usersRepository.create(createUserDto)
      return this.usersRepository.save(newUser)
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('Something went wrong while creating a new user.')
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id)
    const { email, password, confirm_password, ...data } = updateUserDto
    if (user.email !== email && email) {
      user.email = email
    }
    if (password && confirm_password) {
      if (password !== confirm_password) {
        throw new BadRequestException('Passwords do not match.')
      }
      if (await compareHash(password, user.password)) {
        throw new BadRequestException('New password cannot be the same as your old password.')
      }
      user.password = await hash(password)
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

  async updateUserImageId(id: string, avatar: string): Promise<User> {
    const user = await this.findById(id)
    return this.update(user.id, { avatar })
  }

  async findImageNameByUserId(id: string): Promise<string> {
    const user = await this.findById(id)
    return user.avatar
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
