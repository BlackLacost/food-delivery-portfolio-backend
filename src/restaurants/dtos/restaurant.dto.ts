import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsPositive } from 'class-validator';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@InputType()
export class RestaurantInput {
  @Field((type) => Int)
  @IsPositive()
  @IsInt()
  restaurantId: number;
}

@ObjectType()
export class RestaurantOutput {
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}

@ObjectType()
export class RestaurantsOutput {
  @Field((type) => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
