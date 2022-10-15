import { DynamicModule, Global, Module } from '@nestjs/common';
import { CloudinaryOptions } from 'src/cloudinary/cloudinary.interfaces';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CLOUDINARY_OPTIONS } from 'src/common/common.constants';

@Module({})
@Global()
export class CloudinaryModule {
  static forRoot(options: CloudinaryOptions): DynamicModule {
    return {
      module: CloudinaryModule,
      providers: [
        { provide: CLOUDINARY_OPTIONS, useValue: options },
        CloudinaryService,
      ],
      exports: [CloudinaryService],
    };
  }
}
