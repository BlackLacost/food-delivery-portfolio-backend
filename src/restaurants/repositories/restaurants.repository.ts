import { Injectable } from '@nestjs/common';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantNotFoundError } from 'src/restaurants/restaurants.error';
import { DataSource, FindManyOptions, Repository } from 'typeorm';

type RestaurantPagination = {
  results: Restaurant[];
  totalResults: number;
  totalPages: number;
};

@Injectable()
export class RestaurantsRepository extends Repository<Restaurant> {
  constructor(private dataSource: DataSource) {
    super(Restaurant, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<[RestaurantNotFoundError?, Restaurant?]> {
    const restaurant = await this.findOneBy({ id });
    if (!restaurant)
      return [new RestaurantNotFoundError(`Ресторан с id ${id} не найден`)];

    return [undefined, restaurant];
  }

  async findAndCountPagination(
    this: Repository<Restaurant>,
    options: Omit<FindManyOptions<Restaurant>, 'take | skip'>,
    page: number = 1,
    itemsOnPage: number = 25,
  ): Promise<RestaurantPagination> {
    const [results, totalResults] = await this.findAndCount({
      ...options,
      take: itemsOnPage,
      skip: (page - 1) * itemsOnPage,
    });
    const totalPages = Math.ceil(totalResults / itemsOnPage);
    return { results, totalResults, totalPages };
  }
}
