import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from 'src/payments/dtos/create-payment.dto';
import { GetPaymentsOutput } from 'src/payments/dtos/get-payments.dto';
import { Payment } from 'src/payments/entities/payment.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    { restaurantId, transactionId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOneBy({ id: restaurantId });

      if (!restaurant) return { ok: false, error: 'Restaurant not found' };

      if (restaurant.ownerId !== owner.id) {
        return { ok: false, error: 'You are not allowed to do this' };
      }

      await this.payments.save(
        this.payments.create({ transactionId, user: owner, restaurant }),
      );

      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not create payment' };
    }
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({
        where: { user: { id: user.id } },
      });
      return { ok: true, payments };
    } catch (error) {
      return { ok: false, error: 'Could not get payments' };
    }
  }
}
