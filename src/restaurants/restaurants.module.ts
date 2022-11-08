import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coords } from 'src/common/entities/coords.entity';
import { Category } from 'src/restaurants/entities/category.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { DishesRepository } from 'src/restaurants/repositories/dishes.repository';
import { RestaurantsRepository } from 'src/restaurants/repositories/restaurants.repository';
import {
  CategoryResolver,
  DishResovler,
  RestaurantResolver,
} from 'src/restaurants/restaurants.resolver';
import { RestaurantService } from 'src/restaurants/restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category, Dish, Coords])],
  providers: [
    RestaurantResolver,
    CategoryResolver,
    DishResovler,
    RestaurantService,
    DishesRepository,
    RestaurantsRepository,
  ],
  exports: [DishesRepository, RestaurantsRepository],
})
export class RestaurantsModule {}
