import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from 'src/restaurants/entities/category.entity';

@ArgsType()
export class CategoryInput {
  @Field((type) => String)
  @IsString()
  slug: string;
}

@ObjectType()
export class CategoryOutput extends CoreOutput {
  @Field((type) => Category, { nullable: true })
  category?: Category;
}
