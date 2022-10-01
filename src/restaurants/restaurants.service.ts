import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from 'src/restaurants/dtos/create-restaurant.dto';
import { Category } from 'src/restaurants/entities/category.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { slugify } from 'transliteration';
import { Repository } from 'typeorm';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const categorySlug = slugify(createRestaurantInput.categoryName);
      let category = await this.categories.findOneBy({ slug: categorySlug });
      if (!category) {
        category = await this.categories.save(
          this.categories.create({
            name: createRestaurantInput.categoryName,
            slug: categorySlug,
          }),
        );
      }

      const newRestaurant = this.restaurants.create({
        ...createRestaurantInput,
        owner,
        category,
      });

      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not create restaurant' };
    }
  }
}
