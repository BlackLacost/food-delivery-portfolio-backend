import {
  createUnionType,
  Field,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { OrderOutput } from 'src/orders/dtos/order.dto';
import { Order } from 'src/orders/entities/order.entity';
import { OrderNotFoundError } from 'src/orders/orders.error';

@InputType()
export class AcceptOrderInput extends PickType(Order, ['id']) {}

export const AcceptOrderError = createUnionType({
  name: 'AcceptOrderError',
  types: () => [OrderNotFoundError] as const,
});

@ObjectType()
export class AcceptOrderOutput extends OrderOutput {
  @Field((type) => AcceptOrderError, { nullable: true })
  error?: typeof AcceptOrderError;
}
