import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateOrderInput,
  CreateOrderOutput,
} from 'src/orders/dtos/create-order.dto';
import { GetOrderInput, GetOrderOutput } from 'src/orders/dtos/get-order.dto';
import {
  GetOrdersInput,
  GetOrdersOutput,
} from 'src/orders/dtos/get-orders.dto';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantRepository } from 'src/restaurants/repositories/restaurants.repository';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @InjectRepository(Restaurant)
    private readonly restaurants: RestaurantRepository,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOneBy({ id: restaurantId });

      if (!restaurant) return { ok: false, error: 'Restaurant not found' };

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const dish = await this.dishes.findOneBy({ id: item.dishId });
        if (!dish) {
          return { ok: false, error: 'Dish not found' };
        }

        let dishFinalPrice = dish.price;

        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );

          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice += dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices.find(
                (choice) => choice.name === itemOption.choice,
              );
              if (dishOptionChoice.extra) {
                dishFinalPrice += dishOptionChoice.extra;
              }
            }
          }
          orderFinalPrice += dishFinalPrice;
        }
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }

      await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not create order' };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      const orders = await this.orders.findBy({
        ...(user.role === UserRole.Client && { customer: { id: user.id } }),
        ...(user.role === UserRole.Delivery && { driver: { id: user.id } }),
        ...(user.role === UserRole.Owner && {
          restaurant: { owner: { id: user.id } },
        }),
        ...(status && { status }),
      });
      return { ok: true, orders };
    } catch (error) {
      return { ok: false, error: 'Could not get orders' };
    }
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: { id: orderId },
        relations: { restaurant: true },
      });

      if (!order) return { ok: false, error: 'Order not found' };

      // let canSee = true;
      // if (user.role === UserRole.Client && order.customerId !== user.id) {
      //   canSee = false;
      // }

      // if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      //   canSee = false;
      // }

      // if (user.role == UserRole.Owner && order.restaurant.onwerId !== user.id) {
      //   canSee = false;
      // }

      let canSee = false;
      if (user.role === UserRole.Client && order.customerId === user.id) {
        canSee = true;
      }

      if (user.role === UserRole.Delivery && order.driverId === user.id) {
        canSee = true;
      }

      if (
        user.role === UserRole.Owner &&
        order.restaurant.onwerId === user.id
      ) {
        canSee = true;
      }

      if (!canSee) return { ok: false, error: "You can't see that" };

      return { ok: true, order };
    } catch (error) {
      return { ok: false, error: "You can't see that" };
    }
  }
}
