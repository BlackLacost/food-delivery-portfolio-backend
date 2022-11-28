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
import { GetOrderInput, GetOrderOutput } from 'src/orders/dtos/get-order.dto';
import {
  GetOrdersInput,
  GetOrdersOutput,
} from 'src/orders/dtos/get-orders.dto';
import { OrderUpdatesInput } from 'src/orders/dtos/order-updates.dto';
import {
  SetDriverOrderStatusInput,
  SetDriverOrderStatusOutput,
} from 'src/orders/dtos/set-driver-order-status.dto';
import {
  SetRestaurantOrderStatusInput,
  SetRestaurantOrderStatusOutput,
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
  createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput);
  }

  @Query((returns) => GetOrdersOutput)
  @Role(['Any'])
  getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, getOrdersInput);
  }

  @Query((returns) => GetOrderOutput)
  @Role(['Client'])
  getClientOrder(
    @AuthUser() user: User,
    @Args('input') { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getClientOrder(user.id, orderId);
  }

  @Query((returns) => GetOrderOutput)
  @Role(['Owner'])
  getOwnerOrder(
    @AuthUser() user: User,
    @Args('input') { id: ownerId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOwnerOrder(user.id, ownerId);
  }

  @Query((returns) => GetOrderOutput)
  @Role(['Driver'])
  getDriverOrder(
    @AuthUser() user: User,
    @Args('input') { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getDriverOrder(user.id, orderId);
  }

  @Mutation((returns) => SetDriverOrderStatusOutput)
  @Role(['Driver'])
  setDriverOrderStatus(
    @AuthUser() { id: userId }: User,
    @Args('input') { id: orderId, status }: SetDriverOrderStatusInput,
  ): Promise<SetDriverOrderStatusOutput> {
    return this.ordersService.setDriverOrderStatus(userId, orderId, status);
  }

  @Mutation((returns) => SetRestaurantOrderStatusOutput)
  @Role(['Owner'])
  setRestaurantOrderStatus(
    @AuthUser() { id: userId }: User,
    @Args('input') { id: orderId, status }: SetRestaurantOrderStatusInput,
  ): Promise<SetRestaurantOrderStatusOutput> {
    return this.ordersService.setRestaurantOrderStatus(userId, orderId, status);
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
  @Role(['Driver'])
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
  @Role(['Driver'])
  acceptOrder(
    @AuthUser() driver: User,
    @Args('input') acceptOrderInput: AcceptOrderInput,
  ): Promise<AcceptOrderOutput> {
    return this.ordersService.acceptOrder(driver, acceptOrderInput);
  }
}
