import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import * as Joi from 'joi';
import { join } from 'path';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { Coords } from './common/entities/coords.entity';
import { JwtModule } from './jwt/jwt.module';
import { MailModule } from './mail/mail.module';
import { OrderItem } from './orders/entities/order-item.entity';
import { Order } from './orders/entities/order.entity';
import { OrdersModule } from './orders/orders.module';
import { Payment } from './payments/entities/payment.entity';
import { PaymentsModule } from './payments/payments.module';
import { Category } from './restaurants/entities/category.entity';
import { Dish } from './restaurants/entities/dish.entity';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { UploadsModule } from './uploads/uploads.module';
import { User } from './users/entities/user.entity';
import { Verification } from './users/entities/verification.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DATABASE_URL: Joi.string().required(),
        // PGUSER: Joi.string().default('blacklacost'),
        // PGPASSWORD: Joi.string().default('postgres'),
        // PGDATABASE: Joi.string().default('uber-eats-dev'),
        // PGHOST: Joi.string().default('localhost'),
        // PGPORT: Joi.string().default(5432),
        PRIVATE_KEY: Joi.string().required(),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().required(),
        MAIL_SECURE: Joi.boolean().required(),
        MAIL_FROM_EMAIL: Joi.string().required(),
        MAIL_PASSWORD: Joi.string().required(),
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
        CLOUDINARY_FOLDER: Joi.string().required(),
        YOUKASSA_SHOP_ID: Joi.string().required(),
        YOUKASSA_SECRET_KEY: Joi.string().required(),
        URL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            username: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE,
            host: process.env.PGHOST,
            port: +process.env.PGPORT,
          }),
      synchronize: true,
      // For production project
      // synchronize: process.env.NODE_ENV !== 'prod',
      logging: process.env.NODE_ENV === 'dev',
      entities: [
        Coords,
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      subscriptions: {
        // 'graphql-ws': {
        //   onConnect: (context: Context<any>) => {},
        // },
        'graphql-ws': true,
      },
      sortSchema: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, connectionParams }) => {
        if (req) return { token: req.headers['x-jwt'] };

        return { token: connectionParams['x-jwt'] };
      },
    }),
    ScheduleModule.forRoot(),
    JwtModule.forRoot({ privateKey: process.env.PRIVATE_KEY }),
    MailModule.forRoot({
      host: process.env.MAIL_HOST,
      port: +process.env.MAIL_PORT,
      secure: process.env.MAIL_SECURE === 'true' ? true : false,
      fromEmail: process.env.MAIL_FROM_EMAIL,
      password: process.env.MAIL_PASSWORD,
      url: process.env.URL,
    }),
    CloudinaryModule.forRoot({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      folder: process.env.CLOUDINARY_FOLDER,
    }),
    PaymentsModule.forRoot({
      shopId: process.env.YOUKASSA_SHOP_ID,
      secretKey: process.env.YOUKASSA_SECRET_KEY,
    }),
    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    CommonModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// Our middleware doesn't work in Subscription (websocket)
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(JwtMiddleware).forRoutes({
//       path: '/graphql',
//       method: RequestMethod.POST,
//     });
//   }
// }
