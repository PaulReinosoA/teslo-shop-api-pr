import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { ProductImage } from './entities';
import { DataSource } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((img) =>
          this.productImagesRepository.create({
            url: img,
          }),
        ),
        user: user,
      });
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBexception(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, ofset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: ofset,
      relations: { images: true },
    });
    return products.map((product) => ({
      ...product,
      images: product.images.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product | null;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      //product = await this.productRepository.findOneBy({ slug: term });
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title)=:title or LOWER(slug)=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages') //relaciones de tablas
        .getOne();
    }
    if (!product)
      throw new NotFoundException(`product not found with term: ${term}`);
    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto,user:User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map((image) =>
          this.productImagesRepository.create({ url: image }),
        );
      }

      // await this.productRepository.save( product );
      product.user = user;
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBexception(error);
    }
  }

  async remove(id: string) {
    const productRemoved = await this.findOne(id);
    await this.productRepository.remove(productRemoved);
    return productRemoved;
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      throw new Error(`error: ${error}`);
    }
  }

  private handleDBexception(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(`unexpected error, check logs!`);
  }
}
