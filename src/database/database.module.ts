import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './mongoose-config.service';
import { USER_MODEL, UserSchema } from './schema/user.schema';


const MODELS = [
    { name: USER_MODEL, schema: UserSchema },
];

@Global()
@Module({
    imports: [
        MongooseModule.forRootAsync({ useClass: MongooseConfigService }),
        MongooseModule.forFeature(MODELS)
    ],
    exports: [MongooseModule],
})
export class DatabaseModule { }