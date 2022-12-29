import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Order } from 'entities/order.entity'
import Logging from 'library/Logging'
import { AbstractService } from 'modules/common/abstract.service'
import { Repository } from 'typeorm'

import { CreateOrderDto } from './dto/create-order.dto'

@Injectable()
export class OrdersService extends AbstractService {
  constructor(@InjectRepository(Order) private readonly ordersRepository: Repository<Order>) {
    super(ordersRepository)
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const order = this.ordersRepository.create(createOrderDto)
      return this.ordersRepository.save(order)
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('Something went wrong while creating a new order.')
    }
  }
}
