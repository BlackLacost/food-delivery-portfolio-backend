import { Module } from '@nestjs/common';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { Category } from 'src/restaurants/entities/category.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { customCategoryRepositoryMethods } from 'src/restaurants/repositories/category.repository';
import { customRestaurantRepositoryMethods } from 'src/restaurants/repositories/restaurants.repository';
import {
  CategoryResolver,
  RestaurantResolver,
} from 'src/restaurants/restaurants.resolver';
import { RestaurantService } from 'src/restaurants/restaurants.service';
import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category, Dish])],
  providers: [
    RestaurantResolver,
    CategoryResolver,
    RestaurantService,
    {
      provide: getRepositoryToken(Category),
      inject: [getDataSourceToken()],
      useFactory(dataSource: DataSource) {
        return dataSource
          .getRepository(Category)
          .extend(customCategoryRepositoryMethods);
      },
    },
    {
      provide: getRepositoryToken(Restaurant),
      inject: [getDataSourceToken()],
      useFactory(dataSource: DataSource) {
        return dataSource
          .getRepository(Restaurant)
          .extend(customRestaurantRepositoryMethods);
      },
    },
  ],
})
export class RestaurantsModule {}
