import { Field, ObjectType } from '@nestjs/graphql';
import { Payment } from 'src/payments/entities/payment.entity';

@ObjectType()
export class GetPaymentsOutput {
  @Field((type) => [Payment])
  payments: Payment[];
}
