import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : null;

    if (typeof body === 'object' && body && 'code' in body) {
      response.status(status).json(body);
      return;
    }

    const message =
      typeof body === 'string'
        ? body
        : typeof body === 'object' && body && 'message' in body
          ? (body as { message: string | string[] }).message
          : 'Ocurrió un error inesperado';

    response.status(status).json({
      statusCode: status,
      code: status === 400 ? 'VALIDATION_ERROR' : status === 500 ? 'INTERNAL_ERROR' : 'HTTP_ERROR',
      message,
      details: null,
    });
  }
}
