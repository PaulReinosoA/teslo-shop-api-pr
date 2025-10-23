import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { Product } from 'src/products/entities';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deteleTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return 'DEED EXECUTED';
  }

  private async deteleTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach((user) => {
      users.push(
        this.userRepository.create({
          ...user,
          password: bcrypt.hashSync(user.password, 10),
        }),
      );
    });

    const createdUsers = await this.userRepository.save(users);
    return createdUsers[0];
  }

  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts();
    const products = initialData.products;
    const inserPromise: Promise<Product | undefined>[] = [];
    products.forEach((product) =>
      inserPromise.push(this.productsService.create(product, user)),
    );
    await Promise.all(inserPromise);
    return true;
  }
}
