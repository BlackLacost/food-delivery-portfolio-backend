import { Field, Float, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { RestaurantOutput } from 'src/restaurants/dtos/restaurant.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'address',
  'coverImage',
]) {
  @Field((type) => String)
  @IsString()
  categoryName: string;

  @Field((type) => Float)
  latitude: number;

  @Field((type) => Float)
  longitude: number;
}

@ObjectType()
export class CreateRestaurantOutput extends RestaurantOutput {}
