import { Injectable } from '@nestjs/common';
import { DishNotFoundError } from 'src/restaurants/dishes.error';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class DishesRepository extends Repository<Dish> {
  constructor(private dataSource: DataSource) {
    super(Dish, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Dish> {
    const dish = await this.findOneBy({ id });
    if (!dish) throw new DishNotFoundError(`Блюдо с id ${id} не найдено`);
    return dish;
  }
}
