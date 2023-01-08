import {
  createUnionType,
  Field,
  Float,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { UserExistsError } from 'src/users/errors/users.error';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
  'address',
]) {
  @Field((type) => Float, { nullable: true })
  latitude?: number;

  @Field((type) => Float, { nullable: true })
  longitude?: number;
}

const CreateAccountError = createUnionType({
  name: 'CreateAccountError',
  types: () => [UserExistsError] as const,
});

@ObjectType()
export class CreateAccountOutput {
  @Field((type) => String, { nullable: true })
  token?: string;

  @Field((type) => CreateAccountError, { nullable: true })
  error?: typeof CreateAccountError;
}
