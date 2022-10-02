import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AllCategoriesOutput } from 'src/restaurants/dtos/all-categories.dto';
import {
  CategoryInput,
  CategoryOutput,
} from 'src/restaurants/dtos/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from 'src/restaurants/dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from 'src/restaurants/dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from 'src/restaurants/dtos/edit-restaurant.dto';
import { Category } from 'src/restaurants/entities/category.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CategoryRepository } from 'src/restaurants/repositories/category.repository';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );

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

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOneBy({
        id: editRestaurantInput.restaurantId,
      });

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }

      if (owner.id !== restaurant.onwerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }

      Object.assign(
        restaurant,
        editRestaurantInput,
        category ? { category } : null,
      );
      await this.restaurants.save(restaurant);

      return { ok: true, error: null };
    } catch (error) {
      return { ok: false, error: 'Could not edit restaurant' };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOneBy({
        id: restaurantId,
      });

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }

      if (owner.id !== restaurant.onwerId) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        };
      }

      await this.restaurants.delete(restaurantId);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete restaurant',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
        error: null,
      };
    } catch (error) {
      return { ok: false, error: 'Could not load categories' };
    }
  }

  countRestaurants(category: Category): Promise<number> {
    return this.restaurants.count({ where: { category: { id: category.id } } });
  }

  async findCategoryBySlug({ slug }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({
        where: { slug },
        relations: { restaurants: true },
      });

      if (category) {
        return { ok: true, error: null, category };
      } else {
        return { ok: false, error: 'Category not found' };
      }
    } catch (error) {
      return { ok: false, error: 'Could not load category' };
    }
  }
}
