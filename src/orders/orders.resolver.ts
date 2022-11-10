import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
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
import {
  EditOrderInput,
  EditOrderOutput,
} from 'src/orders/dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from 'src/orders/dtos/get-order.dto';
import {
  GetOrdersInput,
  GetOrdersOutput,
} from 'src/orders/dtos/get-orders.dto';
import { OrderUpdatesInput } from 'src/orders/dtos/order-updates.dto';
import {
  SetRestaurantOrderStatusInput,
  SetRestaurantOrderStatusOrderOutput,
} from 'src/orders/dtos/set-restaurant-order-status.dto';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersService } from 'src/orders/orders.service';
import { User } from 'src/users/entities/user.entity';

@Resolver((of) => Order)
export class OrderResolver {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation((returns) => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return {
      order: await this.ordersService.createOrder(customer, createOrderInput),
    };
  }

  @Query((returns) => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return { orders: await this.ordersService.getOrders(user, getOrdersInput) };
  }

  @Query((returns) => GetOrderOutput)
  @Role(['Client'])
  async getClientOrder(
    @AuthUser() user: User,
    @Args('input') { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    const order = await this.ordersService.getClientOrder(user.id, orderId);
    return { order };
  }

  @Query((returns) => GetOrderOutput)
  @Role(['Owner'])
  async getOwnerOrder(
    @AuthUser() user: User,
    @Args('input') { id: ownerId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    const order = await this.ordersService.getOwnerOrder(user.id, ownerId);
    return { order };
  }

  @Query((returns) => GetOrderOutput)
  @Role(['Delivery'])
  async getDriverOrder(
    @AuthUser() user: User,
    @Args('input') { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    const order = await this.ordersService.getDriverOrder(user.id, orderId);
    return { order };
  }

  @Mutation((returns) => SetRestaurantOrderStatusOrderOutput)
  @Role(['Owner'])
  async setRestaurantOrderStatus(
    @AuthUser() { id: userId }: User,
    @Args('input') { id: orderId, status }: SetRestaurantOrderStatusInput,
  ): Promise<SetRestaurantOrderStatusOrderOutput> {
    const order = await this.ordersService.setRestaurantOrderStatus(
      userId,
      orderId,
      status,
    );
    return { order };
  }

  @Mutation((returns) => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return { order: await this.ordersService.editOrder(user, editOrderInput) };
  }

  @Subscription((returns) => Order, {
    filter: (payload, _, { user }) => payload.pendingOrders.ownerId === user.id,
    resolve: (payload) => payload.pendingOrders.order,
  })
  @Role(['Owner'])
  pendingOrders() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription((returns) => Order)
  @Role(['Delivery'])
  cookedOrders() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription((returns) => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User },
    ) => {
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return order.id === input.id;
    },
  })
  @Role(['Any'])
  orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput) {
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
  }

  @Mutation((returns) => AcceptOrderOutput)
  @Role(['Delivery'])
  async acceptOrder(
    @AuthUser() driver: User,
    @Args('input') acceptOrderInput: AcceptOrderInput,
  ): Promise<AcceptOrderOutput> {
    return {
      order: await this.ordersService.acceptOrder(driver, acceptOrderInput),
    };
  }
}
