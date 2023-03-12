import { ICreatePayment, YooCheckout } from '@a2seven/yoo-checkout';
import { Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from 'src/payments/dtos/create-payment.dto';
import { GetPaymentsOutput } from 'src/payments/dtos/get-payments.dto';
import { PromotionPaymentOutput } from 'src/payments/dtos/promotion-payment.dto';
import { Payment } from 'src/payments/entities/payment.entity';
import { YOUKASSA } from 'src/payments/payments.constants';
import { YoukassaOptions } from 'src/payments/payments.interfaces';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantNotFoundError } from 'src/restaurants/errors/restaurants.error';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @Inject(YOUKASSA) private readonly youkassaOptions: YoukassaOptions,
  ) {}

  async createPayment(
    owner: User,
    { restaurantId, transactionId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId, owner: { id: owner.id } },
      relations: { owner: true },
    });

    if (!restaurant) {
      return { error: new RestaurantNotFoundError(restaurantId) };
    }

    await this.payments.save(
      this.payments.create({ transactionId, user: owner, restaurant }),
    );

    restaurant.isPromoted = true;
    const date = new Date();
    date.setDate(date.getDate() + 7);
    restaurant.promotedUntil = date;
    await this.restaurants.save(restaurant);
    return;
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    const payments = await this.payments.find({
      where: { user: { id: user.id } },
    });
    return { payments };
  }

  @Interval(5000)
  async checkPrmotedRestaurants() {
    const restaurants = await this.restaurants.find({
      where: { isPromoted: true, promotedUntil: LessThan(new Date()) },
    });

    for (let restaurant of restaurants) {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant);
    }
  }

  async promotionPayment(
    restaurantId: number,
  ): Promise<PromotionPaymentOutput> {
    const checkout = new YooCheckout(this.youkassaOptions);

    const idempotenceKey = uuidv4();

    const createPayload: ICreatePayment = {
      amount: {
        value: '1000.00',
        currency: 'RUB',
      },
      confirmation: {
        type: 'embedded',
      },
      capture: true,
      description: `Продвижение ресторана ${restaurantId}`,
    };

    const payment = await checkout.createPayment(createPayload, idempotenceKey);
    return {
      result: {
        confirmationToken: payment.confirmation.confirmation_token,
        transactionId: payment.id,
      },
    };
  }
}
