import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import {
  AcceptOrderInput,
  AcceptOrderOutput,
} from 'src/orders/dtos/accept-order.dto';
import {
  CreateOrderInput,
  CreateOrderOutput,
} from 'src/orders/dtos/create-order.dto';
import { GetOrderOutput } from 'src/orders/dtos/get-order.dto';
import {
  GetOrdersInput,
  GetOrdersOutput,
} from 'src/orders/dtos/get-orders.dto';
import { SetDriverOrderStatusOutput } from 'src/orders/dtos/set-driver-order-status.dto';
import { SetRestaurantOrderStatusOutput } from 'src/orders/dtos/set-restaurant-order-status.dto';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { OrderStatus } from 'src/orders/entities/order.entity';
import {
  DriverOrderStatusError,
  RestaurantOrderStatusError,
} from 'src/orders/errors/order-status.error';
import { OrderNotFoundError } from 'src/orders/errors/orders.error';
import { OrderItemRepository } from 'src/orders/repositories/order-item.repository';
import { OrdersRepository } from 'src/orders/repositories/orders.repository';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { DishNotFoundError } from 'src/restaurants/errors/dishes.error';
import { RestaurantNotFoundError } from 'src/restaurants/errors/restaurants.error';
import { RestaurantsRepository } from 'src/restaurants/repositories/restaurants.repository';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly orders: OrdersRepository,
    private readonly orderItems: OrderItemRepository,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
    private readonly restaurants: RestaurantsRepository,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    const restaurant = await this.restaurants.findOneBy({ id: restaurantId });

    if (!restaurant) {
      return { error: new RestaurantNotFoundError(restaurantId) };
    }

    let orderFinalPrice = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const dish = await this.dishes.findOneBy({ id: item.dishId });

      if (!dish) {
        return { error: new DishNotFoundError(item.dishId) };
      }

      let dishFinalPrice = dish.price;

      if (item.options) {
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
        }
      }

      orderFinalPrice += dishFinalPrice;
      const orderItem = await this.orderItems.createAndSave({
        dish,
        options: item.options,
      });
      orderItems.push(orderItem);
    }

    const order = await this.orders.createAndSave({
      customer,
      restaurant,
      total: orderFinalPrice,
      items: orderItems,
    });

    await this.pubSub.publish(NEW_PENDING_ORDER, {
      pendingOrders: { order, ownerId: restaurant.ownerId },
    });

    return { order };
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    const orders = await this.orders.findBy({
      ...(user.role === UserRole.Client && { customer: { id: user.id } }),
      // ...(user.role === UserRole.Delivery && { driver: { id: user.id } }),
      ...(user.role === UserRole.Owner && {
        restaurant: { owner: { id: user.id } },
      }),
      ...(status && { status }),
    });
    return { orders };
  }

  async getClientOrder(
    userId: number,
    orderId: number,
  ): Promise<GetOrderOutput> {
    const order = await this.orders.findOne({
      where: { customer: { id: userId }, id: orderId },
      relations: { restaurant: true },
    });

    if (!order) {
      return { error: new OrderNotFoundError(orderId, userId) };
    }

    return { order };
  }

  async getOwnerOrder(
    userId: number,
    orderId: number,
  ): Promise<GetOrderOutput> {
    const order = await this.orders.findOne({
      where: { restaurant: { owner: { id: userId } }, id: orderId },
    });

    if (!order) {
      return { error: new OrderNotFoundError(orderId, userId) };
    }

    return { order };
  }

  async getDriverOrder(
    userId: number,
    orderId: number,
  ): Promise<GetOrderOutput> {
    const order = await this.orders.findOne({
      where: { driver: { id: userId }, id: orderId },
      relations: { restaurant: true },
    });

    if (!order) {
      return { error: new OrderNotFoundError(orderId, userId) };
    }

    return { order };
  }

  async setRestaurantOrderStatus(
    userId: number,
    orderId: number,
    status: OrderStatus,
  ): Promise<SetRestaurantOrderStatusOutput> {
    const { order } = await this.getOwnerOrder(userId, orderId);

    if (!order) {
      return { error: new OrderNotFoundError(orderId, userId) };
    }

    if (!(status === OrderStatus.Cooking || status === OrderStatus.Cooked)) {
      return { error: new RestaurantOrderStatusError() };
    }

    order.status = status;
    const updatedOrder = await this.orders.save(order);

    if (status === OrderStatus.Cooked) {
      await this.pubSub.publish(NEW_COOKED_ORDER, {
        cookedOrders: updatedOrder,
      });
    }
    await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: updatedOrder });

    return { order: updatedOrder };
  }

  async setDriverOrderStatus(
    userId: number,
    orderId: number,
    status: OrderStatus,
  ): Promise<SetDriverOrderStatusOutput> {
    const { order, error } = await this.getDriverOrder(userId, orderId);

    if (!order) {
      return { error };
    }

    if (
      status !== OrderStatus.Accepted &&
      status !== OrderStatus.PickedUp &&
      status !== OrderStatus.Delivered
    ) {
      throw new DriverOrderStatusError();
    }

    order.status = status;
    const updatedOrder = await this.orders.save(order);

    await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: updatedOrder });

    return { order: updatedOrder };
  }

  async acceptOrder(
    driver: User,
    { id: orderId }: AcceptOrderInput,
  ): Promise<AcceptOrderOutput> {
    const order = await this.orders.findOneBy({ id: orderId });

    if (!order) {
      return { error: new OrderNotFoundError(orderId, driver.id) };
    }

    order.driver = driver;
    order.status = OrderStatus.Accepted;
    const newOrder = await this.orders.save(order);

    await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });

    return { order: newOrder };
  }
}
