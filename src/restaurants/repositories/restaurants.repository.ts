import { Injectable } from '@nestjs/common';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { DataSource, DeepPartial, FindManyOptions, Repository } from 'typeorm';

type RestaurantPagination = {
  restaurants: Restaurant[];
  totalResults: number;
  totalPages: number;
};

@Injectable()
export class RestaurantsRepository extends Repository<Restaurant> {
  constructor(private dataSource: DataSource) {
    super(Restaurant, dataSource.createEntityManager());
  }

  // TODO: createAndSave сделать базовым, чтобы не надо было это
  // делать для всех репозиториев
  async createAndSave(
    this: Repository<Restaurant>,
    options: DeepPartial<Restaurant>,
  ) {
    return this.save(this.create(options));
  }

  async findAndCountPagination(
    this: Repository<Restaurant>,
    options: Omit<FindManyOptions<Restaurant>, 'take | skip'>,
    page: number = 1,
    itemsOnPage: number = 25,
  ): Promise<RestaurantPagination> {
    const [restaurants, totalResults] = await this.findAndCount({
      ...options,
      take: itemsOnPage,
      skip: (page - 1) * itemsOnPage,
    });
    const totalPages = Math.ceil(totalResults / itemsOnPage);
    return { restaurants, totalResults, totalPages };
  }
}
