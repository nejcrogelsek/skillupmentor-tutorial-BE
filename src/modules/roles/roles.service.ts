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
    const role = this.rolesRepository.create(createRoleDto)
    return this.rolesRepository.save(role)
  }

  async update(roleId: string, updateRoleDto: CreateUpdateRoleDto): Promise<Role> {
    const role = (await this.findById(roleId)) as Role
    role.name = updateRoleDto.name
    return this.rolesRepository.save(role)
  }
}
