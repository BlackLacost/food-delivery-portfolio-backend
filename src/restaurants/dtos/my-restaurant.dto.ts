import {
  createUnionType,
  Field,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { RestaurantOutput } from 'src/restaurants/dtos/restaurant.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantNotFoundError } from 'src/restaurants/errors/restaurants.error';

@InputType()
export class MyRestaurantInput extends PickType(Restaurant, ['id']) {}

export const MyRestaurantError = createUnionType({
  name: 'MyRestaurantError',
  types: () => [RestaurantNotFoundError] as const,
});

@ObjectType()
export class MyRestaurantOutput extends RestaurantOutput {
  @Field((type) => MyRestaurantError, { nullable: true })
  error?: typeof MyRestaurantError;
}
