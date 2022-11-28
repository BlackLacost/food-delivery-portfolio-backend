import {
  createUnionType,
  Field,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { Verification } from 'src/users/entities/verification.entity';
import { VerificationCodeNotFoundError } from 'src/users/errors/verifications.error';

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}

const VerifyEmailError = createUnionType({
  name: 'VerifyEmailError',
  types: () => [VerificationCodeNotFoundError],
});

@ObjectType()
export class VerifyEmailOutput {
  @Field((type) => VerifyEmailError, { nullable: true })
  error?: typeof VerifyEmailError;
}
