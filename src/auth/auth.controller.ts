import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from 'express';
import { GetCurrentUser } from "src/common/decorators";
import { AuthService } from "./auth.service";
import { RegisterUserDTO } from "./dto/register.dto";
import { UserService } from "src/user/user.service";
import { User } from '../database/schema/user.schema';
import { UtilsService } from "src/utils/utils.service";


@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly utilService: UtilsService
    ) { }

    @Post("/login")
    @UseGuards(AuthGuard('local'))
    login(@Res() res: Response, @GetCurrentUser() user: User) {
        const accessToken = this.authService.generateToken(user);
        this.utilService.generateResponse({ user, accessToken }, 'Logged in successfully', res);
    }

    @Post('/register')
    async register(@Res() res: Response, @Body() registerUserDto: RegisterUserDTO) {
        const user = await this.userService.create(registerUserDto);
        const accessToken = this.authService.generateToken(user);
        this.utilService.generateResponse({ user, accessToken }, 'Registered successfully', res);
    }
}