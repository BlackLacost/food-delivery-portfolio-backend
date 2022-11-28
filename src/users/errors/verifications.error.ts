import { InterfaceType, ObjectType } from '@nestjs/graphql';
import { Error } from 'src/common/error';

@InterfaceType({ implements: () => [Error] })
export abstract class VerificationError extends Error {}

@ObjectType({ implements: () => [VerificationError] })
export class VerificationCodeNotFoundError extends VerificationError {
  code: string;

  constructor(code: string) {
    super(`Код ${code} для верификации не найден`);
    this.code = code;
  }
}
