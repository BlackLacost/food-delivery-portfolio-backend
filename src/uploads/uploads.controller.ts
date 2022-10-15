import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageOutput } from 'src/uploads/upload-image.dto';
import { UploadsService } from 'src/uploads/uploads.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadImageOutput> {
    return this.uploadsService.uploadImageToCloudinary(file);
  }
}
