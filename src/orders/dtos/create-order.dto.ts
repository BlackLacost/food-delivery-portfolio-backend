import {
  createUnionType,
  Field,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { OrderItemOption } from 'src/orders/entities/order-item.entity';
import { Order } from 'src/orders/entities/order.entity';
import { DishNotFoundError } from 'src/restaurants/dishes.error';
import { RestaurantNotFoundError } from 'src/restaurants/restaurants.error';

@InputType()
class CreateOrderItemInput {
  @Field((type) => Int)
  dishId: number;

  @Field((type) => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field((type) => Int)
  restaurantId: number;

  @Field((type) => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

const CreateOrderError = createUnionType({
  name: 'CreateOrderError',
  types: () => [RestaurantNotFoundError, DishNotFoundError] as const,
});

@ObjectType()
export class CreateOrderOutput {
  @Field((type) => Order, { nullable: true })
  order?: Order;

  @Field((type) => [CreateOrderError], { nullable: true })
  errors?: [typeof CreateOrderError];
}
