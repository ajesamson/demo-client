import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Inject(Logger) private readonly logger: LoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;
    const now = Date.now();

    this.logger.log(
      `Incoming Request - ${method} ${url}`,
      LoggingInterceptor.name,
    );
    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(
            `Response - ${method} ${url} - ${Date.now() - now}ms`,
            LoggingInterceptor.name,
          ),
        ),
      );
  }
}
