import { Field, Float, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from 'src/users/entities/user.entity';

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

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}
