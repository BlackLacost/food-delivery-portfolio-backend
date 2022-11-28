import {
  createUnionType,
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { UserNotFoundError } from 'src/users/errors/users.error';

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}

const EditProfileError = createUnionType({
  name: 'EditProfileError',
  types: () => [UserNotFoundError] as const,
});

@ObjectType()
export class EditProfileOutput {
  @Field((type) => User, { nullable: true })
  user?: User;

  @Field((type) => EditProfileError, { nullable: true })
  error?: typeof EditProfileError;
}
