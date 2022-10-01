import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsInt, IsPositive } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field((type) => Number)
  @IsInt()
  @IsPositive()
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
