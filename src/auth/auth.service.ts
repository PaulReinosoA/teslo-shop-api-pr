import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userdata } = createUserDto;

      const userCreated = this.userRepository.create({
        ...userdata,
        password: bcrypt.hashSync(password, 10),
      });
      //delete user.password
      const user = await this.userRepository.save(userCreated);
      //TODO retornar jwt
      return {
        ...user,
        token: this.getJwtoken({ id: user.id /*email: user.email*/ }),
      };
    } catch (error) {
      console.log(error);
      this.handleDBexception(error);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, fullName: true }, //! OJO!
    });

    console.log({ user });
    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');
    //TODO retornar jwt
    return {
      ...user,
      token: this.getJwtoken({ /*email: user.email*/ id: user.id }),
    };
  }

  async checkAuthStatus(userCheck: LoginUserDto) {
    const { email } = userCheck;
    console.log({ userCheck });
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true,
        fullName: true,
        roles: true,
        isActive: true,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return {
      ...user,
      token: this.getJwtoken({ /*email: user.email*/ id: user.id }),
    };
  }

  private getJwtoken(payload: JwtPayload) {
    const token = this.jwtService.sign({ payload });
    return token;
  }

  private handleDBexception(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(`unexpected error, check logs!`);
  }
}
