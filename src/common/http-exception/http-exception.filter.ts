import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  LoggerService,
} from '@nestjs/common';

import { Response } from 'express';

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
  constructor(@Inject(Logger) private readonly logger: LoggerService) {}

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    this.logger.error({
      message: typeof message === 'string' ? message : JSON.stringify(message),
      stack: (exception as any)?.stack,
      method: request.method,
      url: request.url,
    });

    response.status(status).json({
      status: 'error',
      message,
      data: null,
      error: {
        path: request.url,
        timestamp: new Date().toISOString(),
        statusCode: status,
        ...(typeof errorResponse === 'object' ? errorResponse : {}),
      },
    });
  }
}
