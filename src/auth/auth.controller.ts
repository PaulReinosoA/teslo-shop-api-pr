import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { RawHeaders, GetUser } from './decorators';
import * as http from 'http';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.interfces';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { Auth } from './decorators/auth.decortor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Post('check-auth-status')
  @UseGuards(AuthGuard())
  checkAuthStatus(@Body() user: LoginUserDto) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @Req() req: Express.Request,
    @GetUser('email') userEmail: string, //custom decorators
    @RawHeaders() rawHeaders: string, //custom decorators
    @Headers() headers: http.IncomingHttpHeaders, //custom decorators
  ) {
    console.log(req);
    //console.log(user);
    return {
      ok: true,
      mesg: 'holla muneod private',
      user: user,
      userEmail: userEmail,
      rawHeaders,
      headers,
    };
  }

  // @SetMetadata('roles', ['admin','super-user'])

  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.user) //agrego el roll para la ruta o ninguno si no quiero proteger la ruta
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
