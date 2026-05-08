"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const path = require("path");
const fs = require("fs");
const uuid_1 = require("uuid");
let UploadService = class UploadService {
    constructor(configService) {
        this.configService = configService;
    }
    async uploadFile(file, folder = 'general') {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.mimetype))
            throw new common_1.BadRequestException('Only image files are allowed');
        const uploadDir = path.join(this.configService.get('UPLOAD_DIR', 'uploads'), folder);
        if (!fs.existsSync(uploadDir))
            fs.mkdirSync(uploadDir, { recursive: true });
        const ext = path.extname(file.originalname);
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, file.buffer);
        const appUrl = this.configService.get('APP_URL', 'http://localhost:8080');
        return { url: `${appUrl}/uploads/${folder}/${filename}`, filename };
    }
    async deleteFile(filename, folder = 'general') {
        const filepath = path.join(this.configService.get('UPLOAD_DIR', 'uploads'), folder, filename);
        if (fs.existsSync(filepath))
            fs.unlinkSync(filepath);
        return { message: 'File deleted' };
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map
