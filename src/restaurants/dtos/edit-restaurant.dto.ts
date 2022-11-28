import {
  createUnionType,
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
} from '@nestjs/graphql';
import { IsInt, IsPositive } from 'class-validator';
import { CreateRestaurantInput } from 'src/restaurants/dtos/create-restaurant.dto';
import { RestaurantOutput } from 'src/restaurants/dtos/restaurant.dto';
import { RestaurantNotFoundError } from 'src/restaurants/errors/restaurants.error';

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field((type) => Int)
  @IsInt()
  @IsPositive()
  restaurantId: number;
}

const EditRestaurantError = createUnionType({
  name: 'EditRestaurantError',
  types: () => [RestaurantNotFoundError] as const,
});

@ObjectType()
export class EditRestaurantOutput extends RestaurantOutput {
  @Field((type) => EditRestaurantError, { nullable: true })
  error?: typeof EditRestaurantError;
}
