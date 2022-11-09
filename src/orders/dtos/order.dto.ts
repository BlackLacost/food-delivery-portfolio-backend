import { Field, ObjectType } from '@nestjs/graphql';
import { Order } from 'src/orders/entities/order.entity';

@ObjectType()
export class OrderOutput {
  @Field((type) => Order, { nullable: true })
  order?: Order;
}
