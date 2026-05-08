// upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async uploadFile(file: Express.Multer.File, folder = 'general'): Promise<{ url: string; filename: string }> {
    if (!file) throw new BadRequestException('No file provided');
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) throw new BadRequestException('Only image files are allowed');

    const uploadDir = path.join(this.configService.get('UPLOAD_DIR', 'uploads'), folder);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    const appUrl = this.configService.get('APP_URL', 'http://localhost:8080');
    return { url: `${appUrl}/uploads/${folder}/${filename}`, filename };
  }

  async deleteFile(filename: string, folder = 'general') {
    const filepath = path.join(this.configService.get('UPLOAD_DIR', 'uploads'), folder, filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    return { message: 'File deleted' };
  }
}
