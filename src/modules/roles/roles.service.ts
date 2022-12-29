import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AbstractService } from 'common/abstract.service'
import { Role } from 'entities/role.entity'
import Logging from 'library/Logging'
import { Repository } from 'typeorm'

import { CreateUpdateRoleDto } from './dto/create-update-role.dto'

@Injectable()
export class RolesService extends AbstractService {
  constructor(@InjectRepository(Role) private readonly rolesRepository: Repository<Role>) {
    super(rolesRepository)
  }

  async create(createRoleDto: CreateUpdateRoleDto): Promise<Role> {
    try {
      const role = this.rolesRepository.create(createRoleDto)
      return this.rolesRepository.save(role)
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('Something went wrong while creating a new role.')
    }
  }

  async update(roleId: string, updateRoleDto: CreateUpdateRoleDto): Promise<Role> {
    const role = (await this.findById(roleId)) as Role
    try {
      role.name = updateRoleDto.name
      return this.rolesRepository.save(role)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while updating the role.')
    }
  }
}
