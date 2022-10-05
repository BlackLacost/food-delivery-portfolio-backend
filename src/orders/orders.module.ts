import { Module } from '@nestjs/common';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderResolver } from 'src/orders/orders.resolver';
import { OrdersService } from 'src/orders/orders.service';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { customRestaurantRepositoryMethods } from 'src/restaurants/repositories/restaurants.repository';
import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Dish])],
  providers: [
    OrderResolver,
    OrdersService,
    {
      provide: getRepositoryToken(Restaurant),
      inject: [getDataSourceToken()],
      useFactory(dataSource: DataSource) {
        return dataSource
          .getRepository(Restaurant)
          .extend(customRestaurantRepositoryMethods);
      },
    },
  ],
})
export class OrdersModule {}
