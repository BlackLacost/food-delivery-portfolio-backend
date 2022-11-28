import { createUnionType, Field } from '@nestjs/graphql';
import { RestaurantOutput } from 'src/restaurants/dtos/restaurant.dto';
import { RestaurantNotFoundError } from 'src/restaurants/errors/restaurants.error';

const GetRestaurantError = createUnionType({
  name: 'GetRestaurantError',
  types: () => [RestaurantNotFoundError] as const,
});

export class GetRestaurantOutput extends RestaurantOutput {
  @Field((type) => GetRestaurantError, { nullable: true })
  error?: typeof GetRestaurantError;
}
