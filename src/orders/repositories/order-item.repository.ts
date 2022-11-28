import { Injectable } from '@nestjs/common';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { DataSource, DeepPartial, Repository } from 'typeorm';

@Injectable()
export class OrderItemRepository extends Repository<OrderItem> {
  constructor(private dataSource: DataSource) {
    super(OrderItem, dataSource.createEntityManager());
  }

  async createAndSave(orderItem: DeepPartial<OrderItem>): Promise<OrderItem> {
    return this.save(this.create(orderItem));
  }
}
