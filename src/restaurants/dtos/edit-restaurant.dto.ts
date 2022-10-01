import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
} from '@nestjs/graphql';
import { IsInt, IsPositive } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { CreateRestaurantInput } from 'src/restaurants/dtos/create-restaurant.dto';

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field((type) => Int)
  @IsInt()
  @IsPositive()
  restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}
