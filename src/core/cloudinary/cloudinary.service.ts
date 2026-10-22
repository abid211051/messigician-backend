import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile, unlink } from 'node:fs/promises';
import { v2 as cloudinary } from 'cloudinary';

import { CLOUDINARY_FOLDER } from '../core.constant.js';

export interface CloudinaryImage {
  url: string;
  public_id: string;
}

@Injectable()
export class CloudinaryService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<CloudinaryImage> {
    try {
      const buffer = await readFile(file.path);

      return await new Promise<CloudinaryImage>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: CLOUDINARY_FOLDER,
              transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (error, result) => {
              if (error) return reject(error);
              if (!result) return reject(new Error('Cloudinary upload failed'));

              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            },
          )
          .end(buffer);
      });
    } finally {
      await this.deleteLocalFile(file.path);
    }
  }

  async uploadImages(files: Express.Multer.File[]): Promise<CloudinaryImage[]> {
    const images: CloudinaryImage[] = [];

    try {
      for (const file of files) {
        images.push(await this.uploadImage(file));
      }

      return images;
    } catch (error) {
      await Promise.all(
        images.map((image) =>
          this.deleteImage(image.public_id).catch((cleanupError) => {
            console.error('Failed to delete uploaded image:', cleanupError);
            return null;
          }),
        ),
      );

      // Remove remaining files that weren't uploaded yet.
      await Promise.all(
        files
          .slice(images.length)
          .map((file) => this.deleteLocalFile(file.path)),
      );

      throw error;
    }
  }

  private async deleteLocalFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to delete temporary upload:', error);
      }
    }
  }

  deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}
