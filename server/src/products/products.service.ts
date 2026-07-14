import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const slug = dto.slug.trim().toLowerCase();
    const sku = dto.sku.trim().toUpperCase();

    const existingProduct = await this.prisma.product.findFirst({
      where: {
        OR: [{ slug }, { sku }],
      },
    });

    if (existingProduct) {
      throw new ConflictException(
        'Товар с таким slug или артикулом уже существует',
      );
    }

    const category = await this.prisma.category.findUnique({
      where: {
        id: dto.categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return this.prisma.product.create({
      data: {
        name: dto.name.trim(),
        slug,
        sku,
        description: dto.description?.trim() || null,
        price: dto.price,
        oldPrice: dto.oldPrice ?? null,
        quantity: dto.quantity,
        unit: dto.unit,
        status: dto.status,
        isFeatured: dto.isFeatured ?? false,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    const slug = dto.slug?.trim().toLowerCase();
    const sku = dto.sku?.trim().toUpperCase();

    if (slug || sku) {
      const duplicateProduct = await this.prisma.product.findFirst({
        where: {
          id: {
            not: id,
          },
          OR: [
            ...(slug ? [{ slug }] : []),
            ...(sku ? [{ sku }] : []),
          ],
        },
      });

      if (duplicateProduct) {
        throw new ConflictException(
          'Другой товар уже использует такой slug или артикул',
        );
      }
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: dto.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Категория не найдена');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        slug,
        sku,
        description:
          dto.description === undefined
            ? undefined
            : dto.description.trim() || null,
        price: dto.price,
        oldPrice:
          dto.oldPrice === undefined ? undefined : dto.oldPrice,
        quantity: dto.quantity,
        unit: dto.unit,
        status: dto.status,
        isFeatured: dto.isFeatured,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
  }

  async addImage(
    productId: string,
    file: Express.Multer.File,
  ) {
    await this.findOne(productId);

    const imagesCount = await this.prisma.productImage.count({
      where: {
        productId,
      },
    });

    return this.prisma.productImage.create({
      data: {
        productId,
        filename: file.filename,
        url: `/uploads/products/${file.filename}`,
        position: imagesCount,
        isPrimary: imagesCount === 0,
      },
    });
  }

  async removeImage(productId: string, imageId: string) {
    await this.findOne(productId);

    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
    });

    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }

    await this.prisma.productImage.delete({
      where: {
        id: imageId,
      },
    });

    return {
      message: 'Изображение успешно удалено',
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      message: 'Товар успешно удалён',
    };
  }
}