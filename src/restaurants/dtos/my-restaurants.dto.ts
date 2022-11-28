import { ObjectType } from '@nestjs/graphql';
import { RestaurantsOutput } from 'src/restaurants/dtos/restaurant.dto';

@ObjectType()
export class MyRestaurantsOutput extends RestaurantsOutput {}
