import { Category } from 'src/restaurants/entities/category.entity';
import { slugify } from 'transliteration';
import { Repository } from 'typeorm';

// @EntityRepository deprecated
// https://github.com/leosuncin/nest-typeorm-custom-repository - i use this
// https://gist.github.com/anchan828/9e569f076e7bc18daf21c652f7c3d012 - not try
export interface CategoryRepository extends Repository<Category> {
  this: Repository<Category>;

  getOrCreate(name: string): Promise<Category>;
}

export const customCategoryRepositoryMethods: Pick<
  CategoryRepository,
  'getOrCreate'
> = {
  async getOrCreate(
    this: Repository<Category>,
    name: string,
  ): Promise<Category> {
    const slug = slugify(name);
    let category = await this.findOneBy({ slug });
    if (!category) {
      category = await this.save(this.create({ name, slug }));
    }
    return category;
  },
};
