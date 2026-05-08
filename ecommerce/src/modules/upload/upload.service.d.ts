import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder?: string): Promise<{
        url: string;
        filename: string;
    }>;
    deleteFile(filename: string, folder?: string): Promise<{
        message: string;
    }>;
}
