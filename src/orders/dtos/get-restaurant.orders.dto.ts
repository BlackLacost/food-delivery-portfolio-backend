import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Order, OrderStatus } from 'src/orders/entities/order.entity';

@InputType()
export class GetRestaurantOrdersInput {
  @Field((type) => Int)
  restaurantId: number;

  @Field((type) => [OrderStatus], { nullable: true })
  statuses?: OrderStatus[];
}

@ObjectType()
export class GetRestaurantOrdersOutput {
  @Field((type) => [Order])
  orders: Order[];
}
