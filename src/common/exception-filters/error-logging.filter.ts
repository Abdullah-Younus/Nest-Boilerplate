import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Injectable,
    Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
@Catch()
export class ErrorLoggingFilter implements ExceptionFilter {
    private readonly logger = new Logger(ErrorLoggingFilter.name);

    async catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const statusCode = exception instanceof HttpException ? exception.getStatus() : 500;
        const message = Array.isArray(exception?.response?.message) ? exception.response.message[0] : exception?.message?.replace(/\"/g, '');
        const path = request.url;

        // Log the error details
        this.logger.error(`${request.method} ${path} ${statusCode} - ${message}`);
        response.status(statusCode).json({ statusCode, message });
    }
}