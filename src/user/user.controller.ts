import {
    Body, Controller, Get, ParseIntPipe
    , Post, Put, Query, Req, Res, UseGuards
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from './user.service';
import { GetCurrentUserId } from 'src/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { fetchAllUsersQuery } from './query/user.query';
import { UpdateProfileImageDTO, UpdateUserDTO } from './dto/update-user.dto';
import { UtilsService } from 'src/utils/utils.service';
import { UserDocument } from 'src/database/schema/user.schema';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly utilService: UtilsService
    ) { }

    @Post("/otp")
    async sendOtp(@Res() res: Response, @Body('email') email: string) {
        if (!email) this.utilService.throwException('Email is required', 422);

        const user: UserDocument = await this.userService.findOne({ email });
        if (!user) this.utilService.throwException('User not found', 404);

        user.otp = this.utilService.generateRandomOTP();
        user.otpExpiry = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_TIME) * 60 * 1000);
        await user.save();

        this.utilService.generateResponse({ otp: user.otp }, "OTP sent successfully ", res)
    }

    @Post("/check-email")
    async emailAvailable(@Res() res: Response, @Body("email") email: string) {
        if (!email) this.utilService.throwException('Email is required ', 422);

        const user = await this.userService.findOne({ email });
        if (user) this.utilService.throwException('Email is already exists', 409);

        this.utilService.generateResponse({}, 'Email available', res);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll(
        @GetCurrentUserId() userId: string,
        @Res() res: Response,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
        @Query('search') search: string = ''
    ) {
        const query = fetchAllUsersQuery(userId, search);
        const users = await this.userService.findAll({ query, page, limit, search });
        this.utilService.generateResponse(users, 'Users fetched successfully', res);
    }

    @Get('/profile')
    @UseGuards(AuthGuard('jwt'))
    async findOne(@Res() res: Response, @GetCurrentUserId() userId: string, @Query('userId') user: string) {
        let query = { _id: userId };
        if (user) query = { _id: user };

        const userObj = await this.userService.findOne(query);
        if (!userObj) this.utilService.throwException('User not found', 404);

        this.utilService.generateResponse(userObj, 'Fetched profile successfully', res);
    }

    @Put("update")
    @UseGuards(AuthGuard('jwt'))
    async update(@GetCurrentUserId() user: string, @Body() updateUserDto: UpdateUserDTO, @Res() res: Response) {
        const userObj = await this.userService.updateUser(user, updateUserDto);
        this.utilService.generateResponse(userObj, 'Updated successfully', res);
    }

    @Put('/upload-image')
    @UseGuards(AuthGuard('jwt'))
    async updateUserImage(@GetCurrentUserId() user: string, @Body() updateProfileImageDTO: UpdateProfileImageDTO, @Res() res: Response) {
        const userObj = await this.userService.updateProfileImage(user, updateProfileImageDTO);
        this.utilService.generateResponse(userObj, "Updated Successfully", res);
    }

    @Put('/otp-verify')
    async veriftyOtp(@Res() res: Response, @Body('email') email: string, @Body('otp') otp: string) {
        if (!email || !otp) this.utilService.throwException('Email and OTP are required', 422);

        const user = await this.userService.findOne({ email, otp });
        if (!user) this.utilService.throwException('OTP not found', 404);

        if (user.otpExpiry < new Date()) this.utilService.throwException('OTP expired', 400);

        const resetToken = this.utilService.generateResetPasswordToken(user);

        user.otp = null;
        user.otpExpiry = null;
        user.resetPassword = resetToken;

        await user.save();

        this.utilService.generateResponse({ resetToken }, "OTP verified successfully", res);

    }

    @Put("/reset-password")
    @UseGuards(AuthGuard('jwt'))
    async resetPassword(@Req() req: Request, @Res() res: Response, @Body('password') password: string) {
        if (!password) this.utilService.throwException('password is required', 422);

        const resetPasswordToken = req.headers.authorization.split(' ')[1];

        const user = await this.userService.findOne({ resetPasswordToken });
        if (!user) this.utilService.throwException('Invalid token', 401);

        user.password = this.utilService.hashPassword(password);
        user.resetPassword = null;
        await user.save();

        this.utilService.generateResponse(user, 'Password reset successfully', res);
    }
}