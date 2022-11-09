import { Injectable } from '@nestjs/common';
import { Order } from 'src/orders/entities/order.entity';
import { OrderNotFoundError } from 'src/orders/orders.error';
import { DataSource, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class OrdersRepository extends Repository<Order> {
  constructor(private dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  async findById(
    id: number,
    options?: Pick<FindOneOptions<Order>, 'relations'>,
  ): Promise<Order> {
    const order = await this.findOne({ where: { id }, ...options });
    if (!order) throw new OrderNotFoundError(`Заказ с id ${id} не найден`);
    return order;
  }
}
