import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/payments/entities/payment.entity';
import { YOUKASSA } from 'src/payments/payments.constants';
import { YoukassaOptions } from 'src/payments/payments.interfaces';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsResolver } from './payments.resolver';
import { PaymentsService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
  providers: [PaymentsResolver, PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {
  static forRoot(options: YoukassaOptions): DynamicModule {
    return {
      module: PaymentsModule,
      providers: [
        {
          provide: YOUKASSA,
          useValue: options,
        },
      ],
    };
  }
}
