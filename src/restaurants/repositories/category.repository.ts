import { Injectable } from '@nestjs/common';
import { Category } from 'src/restaurants/entities/category.entity';
import { slugify } from 'transliteration';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

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
  }
}
