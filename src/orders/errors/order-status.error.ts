import { InterfaceType, ObjectType } from '@nestjs/graphql';
import { Error } from 'src/common/error';
import { RestaurantOrderStatus } from 'src/orders/dtos/set-restaurant-order-status.dto';

@InterfaceType({ implements: () => [Error] })
export abstract class OrderStatusError extends Error {}

@ObjectType({ implements: () => [OrderStatusError] })
export class RestaurantOrderStatusError extends OrderStatusError {
  constructor() {
    super(
      `Вам доступны только статусы: ${RestaurantOrderStatus.Cooking} и ${RestaurantOrderStatus.Cooked}`,
    );
  }
}
