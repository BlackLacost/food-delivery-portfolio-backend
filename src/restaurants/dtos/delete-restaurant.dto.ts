import { createUnionType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsInt, IsPositive } from 'class-validator';
import { RestaurantNotFoundError } from 'src/restaurants/errors/restaurants.error';

@InputType()
export class DeleteRestaurantInput {
  @Field((type) => Number)
  @IsInt()
  @IsPositive()
  restaurantId: number;
}

const DeleteRestaurantError = createUnionType({
  name: 'DeleteRestaurantError',
  types: () => [RestaurantNotFoundError] as const,
});

@ObjectType()
export class DeleteRestaurantOutput {
  @Field((type) => DeleteRestaurantError, { nullable: true })
  error?: typeof DeleteRestaurantError;
}
