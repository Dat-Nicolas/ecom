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
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const slugify_1 = require("slugify");
let BrandsService = class BrandsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const slug = (0, slugify_1.default)(data.name, { lower: true, strict: true });
        const ex = await this.prisma.brand.findUnique({ where: { slug } });
        if (ex)
            throw new common_1.ConflictException('Brand already exists');
        return this.prisma.brand.create({ data: { ...data, slug } });
    }
    async findAll() { return this.prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }); }
    async findOne(id) {
        const b = await this.prisma.brand.findUnique({ where: { id } });
        if (!b)
            throw new common_1.NotFoundException('Brand not found');
        return b;
    }
    async update(id, data) { await this.findOne(id); return this.prisma.brand.update({ where: { id }, data }); }
    async remove(id) { await this.findOne(id); return this.prisma.brand.update({ where: { id }, data: { isActive: false } }); }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BrandsService);
//# sourceMappingURL=brands.service.js.map