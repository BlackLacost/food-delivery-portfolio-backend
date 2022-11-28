import { Field, ObjectType } from '@nestjs/graphql';
import { Dish } from 'src/restaurants/entities/dish.entity';

@ObjectType()
export class DishOutput {
  @Field((type) => Dish, { nullable: true })
  dish?: Dish;
}
