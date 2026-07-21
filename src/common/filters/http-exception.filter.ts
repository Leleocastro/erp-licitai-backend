import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message,
      error:
        typeof exceptionResponse === 'string'
          ? exception.name
          : (exceptionResponse as any).error || exception.name,
    };

    response.status(status).json(errorBody);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Erro interno do servidor';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
      error: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal Server Error' : undefined,
    });
  }
}
