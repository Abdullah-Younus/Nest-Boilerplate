import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ROLES } from 'src/common/constants';
import { Document, ObjectId } from 'mongoose';
import { mongoosePlugin, mongooseAggregatePlugin } from 'mongoose-pagination-v2';

@Schema({ timestamps: true, versionKey: false })
export class User {
    // no '@Prop' decorator needed because '_id' is controlled by Mongoose
    _id: ObjectId;

    @Prop()
    fullName: string;

    @Prop()
    email: string;

    @Prop({ select: false })
    password: string;

    @Prop()
    phone: string;

    @Prop()
    company: string;

    @Prop()
    image: string;

    @Prop({ type: String, enum: Object.values(ROLES) })
    role: ROLES;

    @Prop()
    otp: number;

    @Prop()
    otpExpiry: Date;

    @Prop()
    resetPassword: string;

    @Prop()
    fcmToken: string;

}

export type UserDocument = User & Document;
export const USER_MODEL = User.name;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.plugin(mongoosePlugin);
UserSchema.plugin(mongooseAggregatePlugin);
