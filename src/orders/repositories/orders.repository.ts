import { Injectable } from '@nestjs/common';
import { Order } from 'src/orders/entities/order.entity';
import { DataSource, DeepPartial, Repository } from 'typeorm';

@Injectable()
export class OrdersRepository extends Repository<Order> {
  constructor(private dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  // TODO: createAndSave один для всех репозиториев
  async createAndSave(order: DeepPartial<Order>): Promise<Order> {
    return this.save(this.create(order));
  }
}
