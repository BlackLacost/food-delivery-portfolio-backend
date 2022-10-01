import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';
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
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
