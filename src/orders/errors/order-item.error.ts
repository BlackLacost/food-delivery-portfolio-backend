import { InterfaceType, ObjectType } from '@nestjs/graphql';
import { Error } from 'src/common/error';

@InterfaceType({ implements: () => [Error] })
export abstract class OrderItemError extends Error {}

@ObjectType({ implements: () => [OrderItemError] })
export class OrderItemNotFoundError extends OrderItemError {
  constructor(orderId: number) {
    super(`Товар с id ${orderId} не найден`);
  }
}
