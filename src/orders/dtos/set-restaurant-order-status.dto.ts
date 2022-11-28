import {
  createUnionType,
  Field,
  InputType,
  ObjectType,
  PickType,
  registerEnumType,
} from '@nestjs/graphql';
import { OrderOutput } from 'src/orders/dtos/order.dto';
import { Order, OrderStatus } from 'src/orders/entities/order.entity';
import { RestaurantOrderStatusError } from 'src/orders/errors/order-status.error';
import { OrderNotFoundError } from 'src/orders/errors/orders.error';

export enum RestaurantOrderStatus {
  Cooking = 'Cooking',
  Cooked = 'Cooked',
}

registerEnumType(RestaurantOrderStatus, { name: 'RestaurantOrderStatus' });

@InputType()
export class SetRestaurantOrderStatusInput extends PickType(Order, ['id']) {
  @Field((type) => RestaurantOrderStatus)
  status: OrderStatus;
}

export const SetRestaurantOrderStatusError = createUnionType({
  name: 'SetRestaurantOrderStatusError',
  types: () => [OrderNotFoundError, RestaurantOrderStatusError] as const,
});

@ObjectType()
export class SetRestaurantOrderStatusOutput extends OrderOutput {
  @Field((type) => SetRestaurantOrderStatusError, { nullable: true })
  error?: typeof SetRestaurantOrderStatusError;
}
