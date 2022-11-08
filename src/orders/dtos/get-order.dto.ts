import {
  createUnionType,
  Field,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { Order } from 'src/orders/entities/order.entity';
import {
  OrderCanNotSeeError,
  OrderNotFoundError,
} from 'src/orders/orders.error';

@InputType()
export class GetOrderInput extends PickType(Order, ['id']) {}

const GetOrderError = createUnionType({
  name: 'GetOrderError',
  types: () => [OrderNotFoundError, OrderCanNotSeeError] as const,
});

@ObjectType()
export class GetOrderOutput {
  @Field((type) => Order, { nullable: true })
  order?: Order;

  @Field((type) => [GetOrderError], { nullable: true })
  errors?: [typeof GetOrderError];
}
