import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug.trim().toLowerCase();

    const existingCategory = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictException(
        'Категория с таким slug уже существует',
      );
    }

    return this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    const slug = dto.slug?.trim().toLowerCase();

    if (slug) {
      const duplicateCategory =
        await this.prisma.category.findFirst({
          where: {
            slug,
            id: {
              not: id,
            },
          },
        });

      if (duplicateCategory) {
        throw new ConflictException(
          'Категория с таким slug уже существует',
        );
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        slug,
        description:
          dto.description === undefined
            ? undefined
            : dto.description.trim() || null,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      message: 'Категория успешно удалена',
    };
  }
}