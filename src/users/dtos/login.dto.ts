import {
  createUnionType,
  Field,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { UserCredentialError } from 'src/users/errors/users.error';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

const LoginError = createUnionType({
  name: 'LoginError',
  types: () => [UserCredentialError] as const,
});

@ObjectType()
export class LoginOutput {
  @Field((type) => String, { nullable: true })
  token?: string;

  @Field((type) => LoginError, { nullable: true })
  error?: typeof LoginError;
}
