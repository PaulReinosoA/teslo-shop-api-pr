import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-images.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Product {
  @ApiProperty({
    example: 'b3b5c3f8-3e8d-4e6f-9f8b-2c3d4e5f6a7b',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shirt',
    description: 'Product title',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  title: string;

  @ApiProperty({
    example: 19.99,
    description: 'Product price',
  })
  @Column('float', { default: 0 })
  price: number;

  @ApiProperty({
    example: 'A cool T-Shirt',
    description: 'Product description',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 'cool_t-shirt',
    description: 'Product slug - for SEO',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product stock',
  })
  @Column('numeric', { default: 0 })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L', 'XL'],
    description: 'Available sizes',
  })
  @Column('text', { array: true })
  sizes: string[];

  @ApiProperty({
    example: 'M',
    description: 'Product gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty({
    example: ['shirt', 't-shirt', 'clothing'],
    description: 'Product tags',
  })
  @Column('text', { array: true, default: [] })
  tags: string[];

  // images

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true, // Esto permite que se guarden automáticamente
    eager: true, // Opcional: carga automática
  })
  images: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug && this.title) {
      this.slug = this.title;
    }

    if (this.slug) {
      this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
