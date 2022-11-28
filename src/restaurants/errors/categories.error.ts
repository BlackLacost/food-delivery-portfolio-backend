import { InterfaceType, ObjectType } from '@nestjs/graphql';
import { Error } from 'src/common/error';

@InterfaceType({ implements: () => [Error] })
export abstract class CategoryError extends Error {}

@ObjectType({ implements: () => [CategoryError] })
export class CategoryNotFoundError extends CategoryError {
  categorySlug: string;

  constructor(categorySlug: string) {
    super(`Категория с slug ${categorySlug} не найдена`);
    this.categorySlug = categorySlug;
  }
}
