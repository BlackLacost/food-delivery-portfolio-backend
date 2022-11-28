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
import { GetRestaurantOutput } from 'src/restaurants/dtos/get-restaurant.dto';
import { MyRestaurantOutput } from 'src/restaurants/dtos/my-restaurant.dto';
import { MyRestaurantsOutput } from 'src/restaurants/dtos/my-restaurants.dto';
import { RestaurantsOutput } from 'src/restaurants/dtos/restaurant.dto';
import { RestaurantsInput } from 'src/restaurants/dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from 'src/restaurants/dtos/search-restaurant.dto';
import { Category } from 'src/restaurants/entities/category.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { CategoryNotFoundError } from 'src/restaurants/errors/categories.error';
import { DishNotFoundError } from 'src/restaurants/errors/dishes.error';
import { RestaurantNotFoundError } from 'src/restaurants/errors/restaurants.error';
import { CategoryRepository } from 'src/restaurants/repositories/category.repository';
import { RestaurantsRepository } from 'src/restaurants/repositories/restaurants.repository';
import { User } from 'src/users/entities/user.entity';
import { ILike, Repository } from 'typeorm';

const itemsOnPage = 25;

@Injectable()
export class RestaurantService {
  constructor(
    private readonly categories: CategoryRepository,
    @InjectRepository(Coords)
    private readonly coords: Repository<Coords>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly restaurants: RestaurantsRepository,
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
    const category = await this.categories.getOrCreate(categoryName);

    const coords = await this.coords.save(
      this.coords.create({ latitude, longitude }),
    );

    const restaurant = await this.restaurants.createAndSave({
      name,
      address,
      coverImage,
      owner,
      coords,
      category,
    });
    return { restaurant };
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    const restaurants = await this.restaurants.find({
      where: { owner: { id: owner.id } },
      relations: { category: true },
    });
    return { restaurants };
  }

  async myRestaurant(
    ownerId: number,
    restaurantId: number,
  ): Promise<MyRestaurantOutput> {
    const restaurant = await this.restaurants.findOne({
      where: { owner: { id: ownerId }, id: restaurantId },
      relations: { menu: true },
    });

    if (!restaurant) {
      return { error: new RestaurantNotFoundError(restaurantId) };
    }

    return { restaurant };
  }

  async editRestaurant(
    ownerId: number,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    const { restaurantId } = editRestaurantInput;
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId, owner: { id: ownerId } },
    });

    if (!restaurant) {
      return { error: new RestaurantNotFoundError(restaurantId) };
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
    const editedRestaurant = await this.restaurants.save(restaurant);

    return { restaurant: editedRestaurant };
  }

  async deleteRestaurant(
    ownerId: number,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId, owner: { id: ownerId } },
    });

    if (!restaurant) {
      return { error: new RestaurantNotFoundError(restaurantId) };
    }

    await this.restaurants.delete(restaurantId);
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    const categories = await this.categories.find();
    return { categories };
  }

  countRestaurants(category: Category): Promise<number> {
    return this.restaurants.count({ where: { category: { id: category.id } } });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    const category = await this.categories.findOne({ where: { slug } });

    if (!category) {
      return { error: new CategoryNotFoundError(slug) };
    }

    const restaurants = await this.restaurants.find({
      where: { category: { id: category.id } },
      take: itemsOnPage,
      skip: (page - 1) * itemsOnPage,
      order: { isPromoted: 'DESC' },
    });
    const totalResults = await this.countRestaurants(category);

    return {
      category,
      restaurants,
      totalPages: Math.ceil(totalResults / itemsOnPage),
      totalResults,
    };
  }

  async allRestaurans({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    return this.restaurants.findAndCountPagination(
      { order: { isPromoted: 'DESC' }, relations: { category: true } },
      page,
    );
  }

  async findRestaurantById(restaurantId: number): Promise<GetRestaurantOutput> {
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId },
      relations: { menu: true, category: true },
    });

    if (!restaurant) {
      return { error: new RestaurantNotFoundError(restaurantId) };
    }
    return { restaurant };
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    return this.restaurants.findAndCountPagination(
      { where: { name: ILike(`%${query}%`) } },
      page,
    );
  }

  async createDish(
    ownerId: number,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    const { restaurantId } = createDishInput;
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId, owner: { id: ownerId } },
    });

    if (!restaurant) {
      return { error: new RestaurantNotFoundError(restaurantId) };
    }

    const dish = await this.dishes.save(
      this.dishes.create({ ...createDishInput, restaurant }),
    );
    return { dish };
  }

  async editDish(
    ownerId: number,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    const { dishId } = editDishInput;
    const dish = await this.dishes.findOne({
      where: { id: dishId, restaurant: { owner: { id: ownerId } } },
      relations: { restaurant: true },
    });

    if (!dish) return { error: new DishNotFoundError(dishId) };

    const editedDish = await this.dishes.save(
      this.dishes.create({ id: dishId, ...editDishInput }),
    );
    return { dish: editedDish };
  }

  async deleteDish(
    ownerId: number,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    const dish = await this.dishes.findOne({
      where: { id: dishId, restaurant: { ownerId } },
      relations: { restaurant: true },
    });

    if (!dish)
      return {
        error: new DishNotFoundError(dishId),
      };

    await this.dishes.delete({ id: dishId });
  }
}
