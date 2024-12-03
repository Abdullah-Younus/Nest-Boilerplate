import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDTO {
    @IsString()
    @IsNotEmpty()
    fullname: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsOptional()
    @Length(6, 20)
    password: string;

    @IsOptional()
    image: string;
}

export class UpdateProfileImageDTO {
    @IsString()
    @IsNotEmpty()
    image: string;
}