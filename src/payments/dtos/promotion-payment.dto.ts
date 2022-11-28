import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Payment } from 'src/payments/entities/payment.entity';

@InputType()
export class PromotionPaymentInput extends PickType(Payment, [
  'restaurantId',
]) {}

@ObjectType()
class PaymentPayload {
  @Field()
  confirmationToken: string;

  @Field()
  transactionId: string;
}

@ObjectType()
export class PromotionPaymentOutput {
  @Field((type) => PaymentPayload, { nullable: true })
  result?: PaymentPayload;
}
