import {
  createUnionType,
  Field,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { OrderOutput } from 'src/orders/dtos/order.dto';
import { Order } from 'src/orders/entities/order.entity';
import {
  OrderCanNotSeeError,
  OrderNotFoundError,
} from 'src/orders/orders.error';

@InputType()
export class GetOrderInput extends PickType(Order, ['id']) {}

export const GetOrderError = createUnionType({
  name: 'GetOrderError',
  types: () => [OrderNotFoundError, OrderCanNotSeeError] as const,
});

@ObjectType()
export class GetOrderOutput extends OrderOutput {
  @Field((type) => GetOrderError, { nullable: true })
  error?: typeof GetOrderError;
}
