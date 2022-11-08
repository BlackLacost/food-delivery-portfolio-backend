import { Injectable } from '@nestjs/common';
import { Order } from 'src/orders/entities/order.entity';
import { OrderNotFoundError } from 'src/orders/orders.error';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class OrdersRepository extends Repository<Order> {
  constructor(private dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  async findByIdWithRestaurant(
    id: number,
  ): Promise<[OrderNotFoundError?, Order?]> {
    const order = await this.findOne({
      where: { id },
      relations: { restaurant: true },
    });
    if (!order) return [new OrderNotFoundError(`Заказ с id ${id} не найден`)];

    return [undefined, order];
  }
}
