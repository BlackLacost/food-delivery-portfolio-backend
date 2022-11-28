import { ArgsType, createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { UserNotFoundError } from 'src/users/errors/users.error';

@ArgsType()
export class UserProfileInput {
  @Field((type) => Number)
  userId: number;
}

const UserProfileError = createUnionType({
  name: 'UserProfileError',
  types: () => [UserNotFoundError] as const,
});

@ObjectType()
export class UserProfileOuput {
  @Field((type) => User, { nullable: true })
  user?: User;

  @Field((type) => UserProfileError, { nullable: true })
  error?: typeof UserProfileError;
}
