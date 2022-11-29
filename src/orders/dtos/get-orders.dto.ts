import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Order, OrderStatus } from 'src/orders/entities/order.entity';

@InputType()
export class GetOrdersInput {
  @Field((type) => [OrderStatus], { nullable: true })
  statuses?: OrderStatus[];
}

@ObjectType()
export class GetOrdersOutput {
  @Field((type) => [Order])
  orders: Order[];
}
