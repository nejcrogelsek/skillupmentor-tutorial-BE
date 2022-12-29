import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import Logging from 'library/Logging'
import { Repository } from 'typeorm'

@Injectable()
export abstract class AbstractService {
  constructor(protected readonly repository: Repository<any>) {}

  async findAll(relations = []): Promise<any[]> {
    try {
      return this.repository.find({ relations })
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for list of element.')
    }
  }

  async findBy(condition, relations = []): Promise<any> {
    try {
      return this.repository.findOne({
        where: condition,
        relations,
      })
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException(`Something went wrong while searching for an element with condition: ${condition}.`)
    }
  }

  async findById(id: string, relations = []): Promise<any> {
    try {
      const element = this.repository.findOne({
        where: { id },
        relations,
      })
      if (!element) {
        throw new BadRequestException(`Cannot find element with id: ${id}`)
      }
      return element
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException(`Something went wrong while searching for an element with id: ${id}`)
    }
  }

  async remove(id: string): Promise<any> {
    const element = await this.findById(id)
    try {
      return this.repository.remove(element)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while deleting the user.')
    }
  }
}
