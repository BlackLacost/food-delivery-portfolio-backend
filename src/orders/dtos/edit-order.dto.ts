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
export class EditOrderInput extends PickType(Order, ['id', 'status']) {}

export const EditOrderError = createUnionType({
  name: 'EditOrderError',
  types: () => [OrderNotFoundError, OrderCanNotSeeError] as const,
});

@ObjectType()
export class EditOrderOutput extends OrderOutput {
  @Field((type) => EditOrderError, { nullable: true })
  error?: typeof EditOrderError;
}
