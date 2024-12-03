import { ROLES } from "src/common/constants";
import { IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator";


export class RegisterUserDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    company: string;

    @IsString()
    @IsNotEmpty()
    role: ROLES;

    @IsString()
    @IsNotEmpty()
    fcmToken: string;

}