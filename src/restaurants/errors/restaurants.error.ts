import { InterfaceType, ObjectType } from '@nestjs/graphql';
import { Error } from 'src/common/error';

@InterfaceType({ implements: () => [Error] })
export abstract class RestaurantError extends Error {}

@ObjectType({ implements: () => [RestaurantError] })
export class RestaurantNotFoundError extends RestaurantError {
  restaurantId: number;

  constructor(restaurantId: number) {
    super(`Ресторан с id ${restaurantId} не найден`);
    this.restaurantId = restaurantId;
  }
}
