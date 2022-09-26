import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/jwt/jwt.constants';
import { JwtModuleOptions } from 'src/jwt/jwt.interface';
import { JwtService } from 'src/jwt/jwt.service';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [{ provide: CONFIG_OPTIONS, useValue: options }, JwtService],
      exports: [JwtService],
    };
  }
}
