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
import { DriverOrderStatusError } from 'src/orders/errors/order-status.error';

export enum DriverOrderStatus {
  Accepted = 'Accepted',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(DriverOrderStatus, { name: 'DriverOrderStatus' });

@InputType()
export class SetDriverOrderStatusInput extends PickType(Order, ['id']) {
  @Field((type) => DriverOrderStatus)
  status: OrderStatus;
}

export const SetDriverOrderStatusError = createUnionType({
  name: 'SetDriverOrderStatusError',
  types: () => [DriverOrderStatusError] as const,
});

@ObjectType()
export class SetDriverOrderStatusOutput extends OrderOutput {
  @Field((type) => DriverOrderStatusError, { nullable: true })
  error?: typeof DriverOrderStatusError;
}
