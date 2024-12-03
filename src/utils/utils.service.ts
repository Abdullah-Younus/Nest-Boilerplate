import { HttpException, Injectable } from "@nestjs/common";
import { Response } from "express";
import * as bcrypt from 'bcrypt';
import { ApiResponse } from "src/interfaces";
import { Types } from "mongoose";
import { sign } from 'jsonwebtoken';
import { User } from "src/database/schema/user.schema";


@Injectable()
export class UtilsService {
    generateResponse(data: any, message: string, res: Response, statusCode: number = 200): void {
        const response: ApiResponse = {
            data,
            message,
            statusCode,
        };

        res.status(statusCode).json(response);
    }

    throwException(message: string, statusCode: number) {
        throw new HttpException({
            statusCode,
            message: message?.replace(/\"/g, ''),
        }, statusCode);
    };

    generateRandomOTP() {
        // OTP from 10000000 to 99999999
        return Math.floor(10000000 + Math.random() * 90000000);
    }

    hashPassword(password: string): string {
        return bcrypt.hashSync(password, 10);
    }

    comparePassword(password: string, hash: string): boolean {
        return bcrypt.compareSync(password, hash);
    }

    getMongoId(id: string = null) {
        return new Types.ObjectId(id);
    }

    generateResetPasswordToken(user: User): string {
        const { RESET_PASSWORD_TOKEN_EXPIRATION, RESET_PASSWORD_TOKEN_SECRET } = process.env;

        const token = sign({
            id: user._id,
            email: user.email
        }, RESET_PASSWORD_TOKEN_SECRET, { expiresIn: RESET_PASSWORD_TOKEN_EXPIRATION });

        return token;
    }
}