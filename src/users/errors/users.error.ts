import { InterfaceType, ObjectType } from '@nestjs/graphql';
import { Error } from 'src/common/error';

@InterfaceType({ implements: () => [Error] })
export abstract class UserError extends Error {}

@ObjectType({ implements: () => [UserError] })
export class UserNotFoundError extends UserError {
  userId: number;

  constructor(userId: number) {
    super(`Пользователь с id ${userId} не найден`);
    this.userId = userId;
  }
}

@ObjectType({ implements: () => [UserError] })
export class UserExistsError extends UserError {
  email: string;

  constructor(email: string) {
    super(`Пользователь ${email} уже существует`);
    this.email = email;
  }
}

@ObjectType({ implements: () => [UserError] })
export class UserCredentialError extends UserError {
  constructor() {
    super('Почта или пароль не верен');
  }
}
