import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { Order } from 'entities/order.entity'
import { PaginatedResult } from 'interfaces/paginated-result.interface'

import { CreateOrderDto } from './dto/create-order.dto'
import { OrdersService } from './orders.service'

@Controller('orders')
@UseInterceptors(ClassSerializerInterceptor)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('page') page: number): Promise<PaginatedResult> {
    return this.ordersService.paginate(page, ['order_items'])
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createProductDto)
  }
}
