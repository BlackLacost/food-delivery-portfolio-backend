import {
  createUnionType,
  Field,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { DishNotFoundError } from 'src/restaurants/errors/dishes.error';

@InputType()
export class DeleteDishInput {
  @Field((type) => Int)
  dishId: number;
}

const DeleteDishError = createUnionType({
  name: 'DeleteDishError',
  types: () => [DishNotFoundError] as const,
});

@ObjectType()
export class DeleteDishOutput {
  @Field((type) => DeleteDishError, { nullable: true })
  error?: typeof DeleteDishError;
}
