import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ErrorLoggingFilter } from 'src/common/exception-filters/error-logging.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS to allow all origins
  app.enableCors();

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    errorHttpStatusCode: 422,
  }));

  app.useGlobalFilters(app.get(ErrorLoggingFilter));

  // Register the global prefix 
  app.setGlobalPrefix('api');

  const PORT = process.env.PORT || 3000;


  await app.listen(PORT);
}
bootstrap();
