import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { GraphQLResolveInfo } from 'graphql';
import { Error } from 'src/common/error';

@Catch()
export class HttpExceptionFilter
  implements GqlExceptionFilter, ExceptionFilter
{
  catch(
    exception: HttpException,
    host: ArgumentsHost,
  ): HttpException | { error: Error } {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo<GraphQLResolveInfo>();

    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error(exception);
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toLocaleDateString(),
      error:
        status !== HttpStatus.INTERNAL_SERVER_ERROR
          ? exception.message || null
          : 'Internal server error',
    };

    // This is for REST petitions
    if (request) {
      const error = {
        ...errorResponse,
        path: request.url,
        method: request.method,
      };

      console.error(
        `${request.method} ${request.url}`,
        JSON.stringify(error),
        'ExceptionFilter',
      );

      response.status(status).json(errorResponse);
      console.log('request');
      return exception;
    } else {
      // This is for GRAPHQL petitions
      const error = {
        ...errorResponse,
        type: info.parentType,
        field: info.fieldName,
      };

      console.error(
        `${info.parentType} ${info.fieldName}`,
        JSON.stringify(error),
        'ExceptionFilter',
      );

      return exception instanceof Error ? { error: exception } : exception;
    }
  }
}
