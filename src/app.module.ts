import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ErrorLoggingFilter } from './common/exception-filters/error-logging.filter';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './common/interceptors/logger.Interceptor';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from './utils/utils.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, expandVariables: true }),
    DatabaseModule,
    UserModule,
    AuthModule,
    UtilsModule,
  ],
  controllers: [AppController],
  providers: [
    ErrorLoggingFilter,
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
  ],
})
export class AppModule { }
