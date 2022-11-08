import { InterfaceType, ObjectType } from '@nestjs/graphql';
import { Error } from 'src/common/error';

@InterfaceType({ implements: () => [Error] })
export abstract class OrderError extends Error {}

@ObjectType({ implements: () => [OrderError] })
export class OrderNotFoundError extends OrderError {}

@ObjectType({ implements: () => [OrderError] })
export class OrderCanNotSeeError extends OrderError {
  constructor() {
    super('Ты не можешь видеть это');
  }
}
