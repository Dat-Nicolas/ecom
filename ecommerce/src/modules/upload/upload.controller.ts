import { Controller, Post, Delete, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';

@ApiTags('upload') @ApiBearerAuth('access-token') @Controller('upload')
export class UploadController {
  constructor(private readonly svc: UploadService) {}

  @Post()
  @ApiOperation({ summary: 'Upload image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  upload(@UploadedFile() file: Express.Multer.File, @Query('folder') folder = 'general') {
    return this.svc.uploadFile(file, folder);
  }

  @Delete(':folder/:filename')
  @ApiOperation({ summary: 'Delete uploaded file' })
  delete(@Param('folder') folder: string, @Param('filename') filename: string) {
    return this.svc.deleteFile(filename, folder);
  }
}
