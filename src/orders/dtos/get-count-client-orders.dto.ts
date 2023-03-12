import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetCountClientOrdersOutput {
  @Field((type) => Int)
  count: number;
}
