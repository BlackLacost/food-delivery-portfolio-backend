import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Category } from 'src/restaurants/entities/category.entity';

@InputType()
export class CategoryInput extends PaginationInput {
  @Field((type) => String)
  @IsString()
  slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
  @Field((type) => Category, { nullable: true })
  category?: Category;
}
