import {
  createUnionType,
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { DishOutput } from 'src/restaurants/dtos/dish.dto';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { DishNotFoundError } from 'src/restaurants/errors/dishes.error';

@InputType()
export class EditDishInput extends PickType(PartialType(Dish), [
  'name',
  'options',
  'price',
  'description',
]) {
  @Field((type) => Int)
  dishId: number;
}

const EditDishError = createUnionType({
  name: 'EditDishError',
  types: () => [DishNotFoundError] as const,
});

@ObjectType()
export class EditDishOutput extends DishOutput {
  @Field((type) => EditDishError, { nullable: true })
  error?: typeof EditDishError;
}
