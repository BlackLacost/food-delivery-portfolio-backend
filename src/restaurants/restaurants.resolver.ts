import { Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@Resolver()
export class RestaurantResolver {
  @Query(() => Restaurant)
  myRestaurant(): Restaurant {
    return {
      name: 'Ilya',
      isGood: true,
    };
  }
}
