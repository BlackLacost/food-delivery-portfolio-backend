import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderResolver } from 'src/orders/orders.resolver';
import { OrdersService } from 'src/orders/orders.service';
import { OrderItemRepository } from 'src/orders/repositories/order-item.repository';
import { OrdersRepository } from 'src/orders/repositories/orders.repository';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Dish]),
    RestaurantsModule,
  ],
  providers: [
    OrderResolver,
    OrdersService,
    OrdersRepository,
    OrderItemRepository,
  ],
})
export class OrdersModule {}
