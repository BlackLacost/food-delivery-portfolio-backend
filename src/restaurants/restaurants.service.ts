import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coords } from 'src/common/entities/coords.entity';
import { AllCategoriesOutput } from 'src/restaurants/dtos/all-categories.dto';
import {
  CategoryInput,
  CategoryOutput,
} from 'src/restaurants/dtos/category.dto';
import {
  CreateDishInput,
  CreateDishOutput,
} from 'src/restaurants/dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from 'src/restaurants/dtos/create-restaurant.dto';
import {
  DeleteDishInput,
  DeleteDishOutput,
} from 'src/restaurants/dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from 'src/restaurants/dtos/delete-restaurant.dto';
import {
  EditDishInput,
  EditDishOutput,
} from 'src/restaurants/dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from 'src/restaurants/dtos/edit-restaurant.dto';
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from 'src/restaurants/dtos/my-restaurant.dto';
import { MyRestaurantsOutput } from 'src/restaurants/dtos/my-restaurants.dto';
import {
  RestaurantInput,
  RestaurantOutput,
} from 'src/restaurants/dtos/restaurant.dto';
import {
  RestaurantsInput,
  RestaurantsOutput,
} from 'src/restaurants/dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from 'src/restaurants/dtos/search-restaurant.dto';
import { Category } from 'src/restaurants/entities/category.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CategoryRepository } from 'src/restaurants/repositories/category.repository';
import { RestaurantRepository } from 'src/restaurants/repositories/restaurants.repository';
import { User } from 'src/users/entities/user.entity';
import { ILike, Repository } from 'typeorm';

const itemsOnPage = 25;

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: RestaurantRepository,
    @InjectRepository(Category)
    private readonly categories: CategoryRepository,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @InjectRepository(Coords)
    private readonly coords: Repository<Coords>,
  ) {}

  async createRestaurant(
    owner: User,
    {
      name,
      address,
      categoryName,
      coverImage,
      latitude,
      longitude,
    }: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const category = await this.categories.getOrCreate(categoryName);

      const coords = await this.coords.save(
        this.coords.create({ latitude, longitude }),
      );

      const newRestaurant = this.restaurants.create({
        name,
        address,
        coverImage,
        owner,
        coords,
        category,
      });

      await this.restaurants.save(newRestaurant);
      return { ok: true, restaurantId: newRestaurant.id };
    } catch (error) {
      return { ok: false, error: 'Could not create restaurant' };
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({
        where: { owner: { id: owner.id } },
        relations: { category: true },
      });

      return { ok: true, results: restaurants };
    } catch (error) {
      return { ok: false, error: 'Could not found restaurants' };
    }
  }

  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { owner: { id: owner.id }, id },
        relations: { menu: true },
      });

      if (!restaurant) return { ok: false, error: 'Restaurant not found' };

      return { ok: true, result: restaurant };
    } catch (error) {
      return { ok: false, error: 'Could not find my restaurant' };
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

      if (owner.id !== restaurant.ownerId) {
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

      if (owner.id !== restaurant.ownerId) {
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

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOneBy({ slug });

      if (!category) return { ok: false, error: 'Category not found' };

      const restaurants = await this.restaurants.find({
        where: { category: { id: category.id } },
        take: itemsOnPage,
        skip: (page - 1) * itemsOnPage,
        order: { isPromoted: 'DESC' },
      });
      const totalResults = await this.countRestaurants(category);

      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalResults / itemsOnPage),
        totalResults,
      };
    } catch (error) {
      return { ok: false, error: 'Could not load category' };
    }
  }

  async allRestaurans({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const { results, totalResults, totalPages } =
        await this.restaurants.findAndCountPagination(
          { order: { isPromoted: 'DESC' }, relations: { category: true } },
          page,
        );
      return {
        ok: true,
        results,
        totalPages,
        totalResults,
      };
    } catch (error) {
      return { ok: false, error: 'Could not load restaurants' };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
        relations: { menu: true, category: true },
      });

      if (!restaurant) return { ok: false, error: 'Restaurant not found' };

      return { ok: true, restaurant };
    } catch (error) {
      return { ok: false, error: 'Could not find restaurant' };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const { results, totalPages, totalResults } =
        await this.restaurants.findAndCountPagination(
          {
            where: {
              name: ILike(`%${query}%`),
            },
          },
          page,
        );
      return { ok: true, restaurants: results, totalPages, totalResults };
    } catch (error) {
      return { ok: false, error: 'Could not search for restaurants' };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOneBy({
        id: createDishInput.restaurantId,
      });

      if (!restaurant) return { ok: false, error: 'Restaurant not found' };

      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: 'You are not owner' };
      }

      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not create dish' };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: editDishInput.dishId },
        relations: { restaurant: true },
      });

      if (!dish) return { ok: false, error: 'Dish not found' };

      if (dish.restaurant.ownerId !== owner.id) {
        return { ok: false, error: 'You are not owner' };
      }

      await this.dishes.save(
        this.dishes.create({ id: editDishInput.dishId, ...editDishInput }),
      );
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not delete dish' };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: dishId },
        relations: { restaurant: true },
      });

      if (!dish) return { ok: false, error: 'Dish not found' };

      if (dish.restaurant.ownerId !== owner.id) {
        return { ok: false, error: 'You are not owner' };
      }

      await this.dishes.delete({ id: dishId });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not delete dish' };
    }
  }
}
