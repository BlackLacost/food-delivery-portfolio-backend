import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsPositive } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field((type) => Int, { defaultValue: 1 })
  @IsPositive()
  @IsInt()
  page: number;
}

@ObjectType()
export class PaginationOutput {
  @Field((type) => Int, { nullable: true })
  totalPages?: number;

  @Field((type) => Int, { nullable: true })
  totalResults?: number;
}
