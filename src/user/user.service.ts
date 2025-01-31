import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterUserDTO } from 'src/auth/dto/register.dto';
import { User, USER_MODEL, UserDocument } from 'src/database/schema/user.schema';
import { UtilsService } from 'src/utils/utils.service';
import { UpdateProfileImageDTO, UpdateUserDTO } from './dto/update-user.dto';
import { loginDTO } from 'src/auth/dto/login.dto';
import { GetAggregatedPaginationQueryParams, GetPaginationQueryParams } from 'src/common/interfaces';
import { getAggregatedPaginatedData, getPaginatedData, PaginatedData } from 'mongoose-pagination-v2';
import { Model, PaginateModel, ProjectionType, QueryOptions, RootFilterQuery } from 'mongoose';
@Injectable()
export class UserService {
    constructor(
        @InjectModel(USER_MODEL) private readonly userModel: Model<UserDocument>,
        private readonly utilService: UtilsService
    ) { }

    async create(registerUserDto: RegisterUserDTO) {
        try {
            const userExists = await this.userModel.findOne({ email: registerUserDto.email });
            if (userExists) {
                this.utilService.throwException('User already exists', 409);
            }
            const hashedPassword = this.utilService.hashPassword(registerUserDto.password);
            const user = await this.userModel.create({ ...registerUserDto, password: hashedPassword });
            return user;
        } catch (error) {
            this.utilService.throwException(error.message, 422);
            console.log(error);
        }
    }

    findOne(filter?: RootFilterQuery<User>, projection?: ProjectionType<User> | null, options?: QueryOptions<User> | null) {
        return this.userModel.findOne(filter, projection, options);
    }

    async updateUser(user: string, updateUserDto: UpdateUserDTO) {
        const userObj = await this.userModel.findById(user);
        if (!userObj) this.utilService.throwException('User not found', 404);

        if (updateUserDto.password) {
            updateUserDto.password = this.utilService.hashPassword(updateUserDto.password);
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(user, { $set: updateUserDto }, { new: true });
        if (!updatedUser) this.utilService.throwException('User not found', 404);
        return updatedUser;
    }

    async updateProfileImage(userId: string, updateProfileImageDto: UpdateProfileImageDTO) {
        const user = await this.userModel.findById(userId);
        if (!user) this.utilService.throwException('User not found', 404);

        user.image = updateProfileImageDto.image;

        const updatedUser = await user.save();
        if (!updatedUser) this.utilService.throwException('User not found', 404);
        return updatedUser;
    }

    async login(loginDto: loginDTO) {
        const user = await this.userModel.findOne({ email: loginDto.email }, '+password');
        if (!user) {
            this.utilService.throwException('User not found', 404);
        }

        const passwordMatch = this.utilService.comparePassword(loginDto.password, user.password);
        if (!passwordMatch) this.utilService.throwException('Password is incorrect!', 401);

        const updatedUser = await this.userModel.findByIdAndUpdate(
            { email: loginDto.email },
            { fcmToken: loginDto.fcmToken },
            { new: true },
        );
        return updatedUser;
    }

    async uploadImage(userId: string, fileName: string) {
        return await this.userModel.findByIdAndUpdate(userId, { $set: { image: `users/${fileName}` } }, { new: true });
    }

    async findAll({ query = {}, page = 1, limit = 10, populate }: GetPaginationQueryParams): Promise<PaginatedData<UserDocument>> {
        const { data, pagination } = await getPaginatedData({
            model: this.userModel as PaginateModel<UserDocument>,
            query,
            page,
            limit,
            sort: { createdAt: -1 },
            populate,
        });

        return { data, pagination };
    }

    async findAllAggregate({ query = [], page = 1, limit = 10 }: GetAggregatedPaginationQueryParams): Promise<PaginatedData<UserDocument>> {
        const { data, pagination }: PaginatedData<UserDocument> = await getAggregatedPaginatedData({
            model: this.userModel as PaginateModel<UserDocument>,
            query,
            page,
            limit,
        });

        return { data, pagination };
    }

    async getFcmTokens(query: RootFilterQuery<User>) {
        const fcmTokensData = await this.userModel.find({ ...query, fcmToken: { $ne: null } }).select('fcmToken');
        return fcmTokensData.map((data) => data.fcmToken);
    }

}
