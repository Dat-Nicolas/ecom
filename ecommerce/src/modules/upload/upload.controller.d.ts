import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly svc;
    constructor(svc: UploadService);
    upload(file: Express.Multer.File, folder?: string): Promise<{
        url: string;
        filename: string;
    }>;
    delete(folder: string, filename: string): Promise<{
        message: string;
    }>;
}
