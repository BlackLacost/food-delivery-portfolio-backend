import { InterfaceType, ObjectType } from '@nestjs/graphql';
import { Error } from 'src/common/error';

@InterfaceType({ implements: () => [Error] })
export abstract class DishError extends Error {}

@ObjectType({ implements: () => [DishError] })
export class DishNotFoundError extends DishError {}
