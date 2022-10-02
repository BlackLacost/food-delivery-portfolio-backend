import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { FindManyOptions, Repository } from 'typeorm';

type RestaurantPagination = {
  results: Restaurant[];
  totalResults: number;
  totalPages: number;
};

// @EntityRepository deprecated
// https://github.com/leosuncin/nest-typeorm-custom-repository - i use this
// https://gist.github.com/anchan828/9e569f076e7bc18daf21c652f7c3d012 - not try
export interface RestaurantRepository extends Repository<Restaurant> {
  this: Repository<Restaurant>;

  findAndCountPagination(
    options: Omit<FindManyOptions<Restaurant>, 'take | skip'>,
    page?: number,
    itemsOnPage?: number,
  ): Promise<RestaurantPagination>;
}

export const customRestaurantRepositoryMethods: Pick<
  RestaurantRepository,
  'findAndCountPagination'
> = {
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
  },
};
