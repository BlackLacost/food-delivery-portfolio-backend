import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UploadController } from 'src/uploads/uploads.controller';
import { UploadsService } from 'src/uploads/uploads.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [UploadController],
  providers: [UploadsService],
})
export class UploadsModule {}
