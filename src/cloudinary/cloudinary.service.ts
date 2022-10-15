import { Inject, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { CloudinaryOptions } from 'src/cloudinary/cloudinary.interfaces';
import { CLOUDINARY_OPTIONS } from 'src/common/common.constants';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY_OPTIONS) private readonly options: CloudinaryOptions,
  ) {
    v2.config({
      cloud_name: this.options.cloudName,
      api_key: this.options.apiKey,
      api_secret: this.options.apiSecret,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { folder: this.options.folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      toStream(file.buffer).pipe(upload);
    });
  }
}
