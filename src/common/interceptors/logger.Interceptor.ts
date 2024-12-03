import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggerInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const startTime = Date.now();

        return next.handle().pipe(
            tap(() => {
                const endTime = Date.now();
                const resTime = endTime - startTime;
                this.logger.log(`${request.method} ${request.path} ${response.statusCode} ${resTime}ms`);
            })
        );
    }
}