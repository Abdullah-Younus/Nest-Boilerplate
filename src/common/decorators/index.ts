import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";
import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import { JwtPayload } from "../interfaces";
import { Types } from "mongoose";

export const GetCurrentUserId = createParamDecorator((_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return user.id;
});

export const GetCurrentUser = createParamDecorator((_: undefined, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest();
    return request.user;
});

export const Roles = (...roles: string[]) => SetMetadata('role', roles);

export function IsObjectId(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isObjectId",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return Types.ObjectId.isValid(value);  // Check if it's a valid ObjectId
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid MongoDB ObjectId`;
                },
            },
        });
    };
}
