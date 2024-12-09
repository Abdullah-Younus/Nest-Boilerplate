import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy } from 'passport-local';
import { UserService } from "src/user/user.service";
import { UtilsService } from "src/utils/utils.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly userService: UserService,
        private readonly utilService: UtilsService
    ) {
        super({ usernameField: 'email', passReqToCallback: true });
    }

    async validation(req: Request, email: string, password: string) {
        try {
            const { fcmToken } = req.body;
            if (!fcmToken) this.utilService.throwException('fcmToken is required', 422);

            const user = await this.userService.login({ email, password, fcmToken });
            return user;
        } catch (error) {
            this.utilService.throwException(error.messsage, 400);
        }
    }

}