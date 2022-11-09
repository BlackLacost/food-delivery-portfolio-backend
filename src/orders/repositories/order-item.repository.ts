import { Injectable } from '@nestjs/common';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { OrderItemNotFoundError } from 'src/orders/errors/order-item.error';
import { DataSource, DeepPartial, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class OrderItemRepository extends Repository<OrderItem> {
  constructor(private dataSource: DataSource) {
    super(OrderItem, dataSource.createEntityManager());
  }

  async findById(
    id: number,
    options?: Pick<FindOneOptions<OrderItem>, 'relations'>,
  ): Promise<OrderItem> {
    const orderItem = await this.findOne({ where: { id }, ...options });
    if (!orderItem)
      throw new OrderItemNotFoundError(`Товар с id ${id} не найден`);
    return orderItem;
  }

  async createAndSave(orderItem: DeepPartial<OrderItem>): Promise<OrderItem> {
    return this.save(this.create(orderItem));
  }
}
