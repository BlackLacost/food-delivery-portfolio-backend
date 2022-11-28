import {
  createUnionType,
  Field,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { OrderOutput } from 'src/orders/dtos/order.dto';
import { OrderItemOption } from 'src/orders/entities/order-item.entity';
import { DishNotFoundError } from 'src/restaurants/errors/dishes.error';
import { RestaurantNotFoundError } from 'src/restaurants/errors/restaurants.error';

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
export class CreateOrderOutput extends OrderOutput {
  @Field((type) => CreateOrderError, { nullable: true })
  error?: typeof CreateOrderError;
}
