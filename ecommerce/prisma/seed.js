"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const adminRole = await prisma.role.upsert({
        where: { slug: 'admin' },
        update: {},
        create: {
            name: 'Admin',
            slug: 'admin',
            permissions: ['*'],
        },
    });
    const customerRole = await prisma.role.upsert({
        where: { slug: 'customer' },
        update: {},
        create: {
            name: 'Customer',
            slug: 'customer',
            permissions: ['orders.view', 'reviews.create', 'profile.edit'],
        },
    });
    console.log('✅ Roles seeded');
    const passwordHash = await bcrypt.hash('Admin@123456', 10);
    await prisma.user.upsert({
        where: { email: 'admin@ecommerce.com' },
        update: {},
        create: {
            roleId: adminRole.id,
            email: 'admin@ecommerce.com',
            phone: '0900000001',
            passwordHash,
            fullName: 'System Admin',
            status: 'active',
            emailVerifiedAt: new Date(),
        },
    });
    const custHash = await bcrypt.hash('Customer@123', 10);
    await prisma.user.upsert({
        where: { email: 'customer@ecommerce.com' },
        update: {},
        create: {
            roleId: customerRole.id,
            email: 'customer@ecommerce.com',
            phone: '0900000002',
            passwordHash: custHash,
            fullName: 'Nguyễn Văn A',
            status: 'active',
            emailVerifiedAt: new Date(),
        },
    });
    console.log('✅ Users seeded');
    const brands = await Promise.all([
        prisma.brand.upsert({
            where: { slug: 'apple' },
            update: {},
            create: { name: 'Apple', slug: 'apple', country: 'US', isActive: true },
        }),
        prisma.brand.upsert({
            where: { slug: 'samsung' },
            update: {},
            create: { name: 'Samsung', slug: 'samsung', country: 'KR', isActive: true },
        }),
        prisma.brand.upsert({
            where: { slug: 'sony' },
            update: {},
            create: { name: 'Sony', slug: 'sony', country: 'JP', isActive: true },
        }),
    ]);
    console.log('✅ Brands seeded');
    const phonesCat = await prisma.category.upsert({
        where: { slug: 'dien-thoai' },
        update: {},
        create: { name: 'Điện thoại', slug: 'dien-thoai', sortOrder: 1, isActive: true },
    });
    const laptopCat = await prisma.category.upsert({
        where: { slug: 'laptop' },
        update: {},
        create: { name: 'Laptop', slug: 'laptop', sortOrder: 2, isActive: true },
    });
    await prisma.category.upsert({
        where: { slug: 'iphone' },
        update: {},
        create: {
            name: 'iPhone',
            slug: 'iphone',
            parentId: phonesCat.id,
            sortOrder: 1,
            isActive: true,
        },
    });
    console.log('✅ Categories seeded');
    const iphone15 = await prisma.product.upsert({
        where: { slug: 'iphone-15-pro-max' },
        update: {},
        create: {
            categoryId: phonesCat.id,
            brandId: brands[0].id,
            name: 'iPhone 15 Pro Max',
            slug: 'iphone-15-pro-max',
            sku: 'IP15PM',
            description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP.',
            price: 34990000,
            salePrice: 32990000,
            weight: 0.221,
            attributes: { chip: 'A17 Pro', display: '6.7 inch Super Retina XDR', camera: '48MP' },
            status: 'active',
            isFeatured: true,
        },
    });
    const variants = await Promise.all([
        prisma.productVariant.upsert({
            where: { sku: 'IP15PM-256-BLK' },
            update: {},
            create: {
                productId: iphone15.id,
                name: 'iPhone 15 Pro Max - 256GB - Titan Đen',
                sku: 'IP15PM-256-BLK',
                attributes: { color: 'Titan Đen', storage: '256GB' },
                price: 34990000,
                salePrice: 32990000,
            },
        }),
        prisma.productVariant.upsert({
            where: { sku: 'IP15PM-512-WHT' },
            update: {},
            create: {
                productId: iphone15.id,
                name: 'iPhone 15 Pro Max - 512GB - Titan Trắng',
                sku: 'IP15PM-512-WHT',
                attributes: { color: 'Titan Trắng', storage: '512GB' },
                price: 39990000,
                salePrice: 37990000,
            },
        }),
    ]);
    console.log('✅ Products & Variants seeded');
    const warehouse = await prisma.warehouse.upsert({
        where: { code: 'WH-HN' },
        update: {},
        create: {
            name: 'Kho Hà Nội',
            code: 'WH-HN',
            address: '123 Đường Láng, Đống Đa',
            province: 'Hà Nội',
            isActive: true,
        },
    });
    for (const variant of variants) {
        await prisma.inventory.upsert({
            where: { variantId_warehouseId: { variantId: variant.id, warehouseId: warehouse.id } },
            update: {},
            create: {
                variantId: variant.id,
                warehouseId: warehouse.id,
                qtyAvailable: 100,
                qtyReserved: 0,
                reorderPoint: 10,
            },
        });
    }
    console.log('✅ Inventory seeded');
    await prisma.coupon.upsert({
        where: { code: 'WELCOME10' },
        update: {},
        create: {
            code: 'WELCOME10',
            type: 'percent',
            value: 10,
            maxDiscount: 500000,
            minOrderValue: 1000000,
            usageLimit: 1000,
            userLimit: 1,
            isActive: true,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
    });
    console.log('✅ Coupons seeded');
    console.log('🎉 Seed completed!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map