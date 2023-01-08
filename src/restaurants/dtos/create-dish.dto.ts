import {
  createUnionType,
  Field,
  InputType,
  Int,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { RestaurantNotFoundError } from 'src/restaurants/errors/restaurants.error';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'description',
  'options',
  'photo',
]) {
  @Field((type) => Int)
  restaurantId: number;
}

const CreateDishError = createUnionType({
  name: 'CreateDishError',
  types: () => [RestaurantNotFoundError] as const,
});

@ObjectType()
export class CreateDishOutput {
  @Field((type) => Dish, { nullable: true })
  dish?: Dish;

  @Field((type) => CreateDishError, { nullable: true })
  error?: typeof CreateDishError;
}
