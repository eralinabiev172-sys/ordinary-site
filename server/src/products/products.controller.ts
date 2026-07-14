import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import {
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
  @Post(':id/images')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@UseInterceptors(
  FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (_request, file, callback) => {
        const uniqueName = `${Date.now()}-${Math.round(
          Math.random() * 1_000_000,
        )}${extname(file.originalname)}`;

        callback(null, uniqueName);
      },
    }),
    fileFilter: (_request, file, callback) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
        return callback(
          new BadRequestException(
            'Разрешены только JPG, PNG и WEBP',
          ),
          false,
        );
      }

      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  }),
)
addImage(
  @Param('id') id: string,
  @UploadedFile() file?: Express.Multer.File,
) {
  if (!file) {
    throw new BadRequestException('Файл изображения не передан');
  }

  return this.productsService.addImage(id, file);
}

@Delete(':productId/images/:imageId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
removeImage(
  @Param('productId') productId: string,
  @Param('imageId') imageId: string,
) {
  return this.productsService.removeImage(productId, imageId);
}
}