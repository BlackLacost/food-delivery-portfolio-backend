import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
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
export class PromotionPaymentOutput extends CoreOutput {
  @Field((type) => PaymentPayload, { nullable: true })
  result?: PaymentPayload;
}
