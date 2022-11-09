import { ArgumentsHost, Catch, ContextType } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): { error: Error } | void {
    if ((host.getType() as ContextType | 'graphql') === 'graphql') {
      return { error: exception };
    }
  }
}
