import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GraphqlExceptionFilter } from 'src/common/graphql.exception';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GraphqlExceptionFilter());
  app.enableCors();
  await app.listen(4000);
}
bootstrap();
