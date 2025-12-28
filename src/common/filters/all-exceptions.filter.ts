import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../dto/api-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorPayload: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        // Nest often returns { message: [...], error: 'Bad Request' } for validation
        errorPayload = res;
        message = (res as any).message ?? JSON.stringify(res);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorPayload = { stack: exception.stack };
    }

    const apiResponse = new ApiResponse(null, Array.isArray(message) ? message.join(', ') : message, {
      path: request.url,
      method: request.method,
      error: errorPayload,
    });

    response.status(status).json(apiResponse);
  }
}
