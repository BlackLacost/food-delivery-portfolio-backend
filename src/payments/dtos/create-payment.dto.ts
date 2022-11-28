import {
  createUnionType,
  Field,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { Payment } from 'src/payments/entities/payment.entity';
import { RestaurantNotFoundError } from 'src/restaurants/errors/restaurants.error';

@InputType()
export class CreatePaymentInput extends PickType(Payment, [
  'transactionId',
  'restaurantId',
]) {}

const CreatePaymentError = createUnionType({
  name: 'CreatePaymentError',
  types: () => [RestaurantNotFoundError] as const,
});

@ObjectType()
export class CreatePaymentOutput {
  @Field((type) => CreatePaymentError, { nullable: true })
  error?: typeof CreatePaymentError;
}
