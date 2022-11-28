import { createUnionType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Category } from 'src/restaurants/entities/category.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CategoryNotFoundError } from 'src/restaurants/errors/categories.error';

@InputType()
export class CategoryInput extends PaginationInput {
  @Field((type) => String)
  @IsString()
  slug: string;
}

const CategoryRestaurantsError = createUnionType({
  name: 'CategoryRestaurantsError',
  types: () => [CategoryNotFoundError] as const,
});

@ObjectType()
export class CategoryOutput extends PaginationOutput {
  @Field((type) => Category, { nullable: true })
  category?: Category;

  @Field((type) => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];

  @Field((type) => CategoryRestaurantsError, { nullable: true })
  error?: typeof CategoryRestaurantsError;
}
