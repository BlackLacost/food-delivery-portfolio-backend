import { Inject, Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { AcceptOrderInput } from 'src/orders/dtos/accept-order.dto';
import { CreateOrderInput } from 'src/orders/dtos/create-order.dto';
import { EditOrderInput } from 'src/orders/dtos/edit-order.dto';
import { GetOrdersInput } from 'src/orders/dtos/get-orders.dto';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Order, OrderStatus } from 'src/orders/entities/order.entity';
import { RestaurantOrderStatusError } from 'src/orders/errors/order-status.error';
import {
  OrderCanNotEditError,
  OrderCanNotSeeError,
  OrderNotFoundError,
} from 'src/orders/errors/orders.error';
import { OrderItemRepository } from 'src/orders/repositories/order-item.repository';
import { OrdersRepository } from 'src/orders/repositories/orders.repository';
import { DishesRepository } from 'src/restaurants/repositories/dishes.repository';
import { RestaurantsRepository } from 'src/restaurants/repositories/restaurants.repository';
import { User, UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dishes: DishesRepository,
    private readonly orders: OrdersRepository,
    private readonly orderItems: OrderItemRepository,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
    private readonly restaurants: RestaurantsRepository,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<Order> {
    const restaurant = await this.restaurants.findById(restaurantId);

    let orderFinalPrice = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const dish = await this.dishes.findById(item.dishId);

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

    return order;
  }

  async getOrders(user: User, { status }: GetOrdersInput): Promise<Order[]> {
    return this.orders.findBy({
      ...(user.role === UserRole.Client && { customer: { id: user.id } }),
      // ...(user.role === UserRole.Delivery && { driver: { id: user.id } }),
      ...(user.role === UserRole.Owner && {
        restaurant: { owner: { id: user.id } },
      }),
      ...(status && { status }),
    });
  }

  async getClientOrder(userId: number, orderId: number): Promise<Order> {
    const order = await this.orders.findOne({
      where: { customer: { id: userId }, id: orderId },
      relations: { restaurant: true },
    });
    if (!order)
      throw new OrderNotFoundError(
        `Заказ ${orderId} клиента ${userId} не найден`,
      );
    return order;
  }

  async getOwnerOrder(userId: number, orderId: number): Promise<Order> {
    const order = await this.orders.findOne({
      where: { restaurant: { owner: { id: userId } }, id: orderId },
    });
    if (!order)
      throw new OrderNotFoundError(
        `Заказ ${orderId} владельца ${userId} не найден`,
      );
    return order;
  }

  async getDriverOrder(userId: number, orderId: number): Promise<Order> {
    const order = await this.orders.findOne({
      where: { driver: { id: userId }, id: orderId },
      relations: { restaurant: true },
    });
    if (!order)
      throw new OrderNotFoundError(
        `Заказ ${orderId} водителя ${userId} не найден`,
      );
    return order;
  }

  canSeeOrder(user: User, order: Order): boolean {
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

    if (user.role === UserRole.Driver && order.driverId === user.id) {
      canSee = true;
    }

    if (user.role === UserRole.Owner && order.restaurant.ownerId === user.id) {
      canSee = true;
    }
    return canSee;
  }

  async setRestaurantOrderStatus(
    userId: number,
    orderId: number,
    status: OrderStatus,
  ): Promise<Order> {
    const order = await this.getOwnerOrder(userId, orderId);
    if (!(status === OrderStatus.Cooking || status === OrderStatus.Cooked)) {
      throw new RestaurantOrderStatusError();
    }
    order.status = status;
    const updatedOrder = await this.orders.save(order);

    if (status === OrderStatus.Cooked) {
      await this.pubSub.publish(NEW_COOKED_ORDER, {
        cookedOrders: updatedOrder,
      });
    }
    await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: updatedOrder });
    return updatedOrder;
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<Order> {
    const order = await this.orders.findById(orderId);

    if (!this.canSeeOrder(user, order)) throw new OrderCanNotSeeError();

    let canEdit = true;
    if (user.role === UserRole.Client) {
      canEdit = false;
    }

    if (user.role === UserRole.Owner) {
      if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
        canEdit = false;
      }
    }

    if (user.role === UserRole.Driver) {
      if (status !== OrderStatus.Accepted && status !== OrderStatus.Delivered) {
        canEdit = false;
      }
    }

    if (!canEdit) throw new OrderCanNotEditError();

    order.status = status;
    const newOrder = await this.orders.save(order);

    if (user.role === UserRole.Owner) {
      if (status === OrderStatus.Cooked)
        await this.pubSub.publish(NEW_COOKED_ORDER, {
          cookedOrders: newOrder,
        });
    }
    await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });

    return newOrder;
  }

  async acceptOrder(
    driver: User,
    { id: orderId }: AcceptOrderInput,
  ): Promise<Order> {
    const order = await this.orders.findById(orderId);
    console.log(order);

    order.driver = driver;
    order.status = OrderStatus.Accepted;
    const newOrder = await this.orders.save(order);

    await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });
    return newOrder;
  }
}
