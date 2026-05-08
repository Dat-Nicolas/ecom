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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page = 1, limit = 20 } = query;
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({ skip: (page - 1) * limit, take: limit, include: { role: true }, orderBy: { createdAt: 'desc' } }),
            this.prisma.user.count(),
        ]);
        return (0, pagination_dto_1.paginate)(data.map(({ passwordHash, ...u }) => u), total, page, limit);
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({ where: { id }, include: { role: true, addresses: true } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { passwordHash, ...rest } = user;
        return rest;
    }
    async getProfile(id) { return this.findOne(id); }
    async updateProfile(id, data) {
        const { passwordHash, roleId, email, ...safe } = data;
        await this.prisma.user.update({ where: { id }, data: safe });
        return this.findOne(id);
    }
    async addAddress(userId, data) {
        if (data.isDefault) {
            await this.prisma.userAddress.updateMany({ where: { userId }, data: { isDefault: false } });
        }
        return this.prisma.userAddress.create({ data: { ...data, userId } });
    }
    async getAddresses(userId) {
        return this.prisma.userAddress.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
    }
    async removeAddress(userId, id) {
        const addr = await this.prisma.userAddress.findFirst({ where: { id, userId } });
        if (!addr)
            throw new common_1.NotFoundException('Address not found');
        await this.prisma.userAddress.delete({ where: { id } });
        return { message: 'Address deleted' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map