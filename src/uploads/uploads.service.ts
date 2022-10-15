import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UploadImageOutput } from 'src/uploads/upload-image.dto';
import toStream = require('buffer-to-stream');

@Injectable()
export class UploadsService {
  constructor(private cloudinary: CloudinaryService) {}

  async uploadImageToCloudinary(
    file: Express.Multer.File,
  ): Promise<UploadImageOutput> {
    try {
      const response = await this.cloudinary.uploadImage(file);
      return { url: response.url };
    } catch (error) {
      throw new BadRequestException('Invalid file type.');
    }
  }
}
