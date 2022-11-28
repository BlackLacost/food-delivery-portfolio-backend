import { Field, ObjectType } from '@nestjs/graphql';
import { Category } from 'src/restaurants/entities/category.entity';

@ObjectType()
export class AllCategoriesOutput {
  @Field((type) => [Category], { nullable: true })
  categories?: Category[];
}
