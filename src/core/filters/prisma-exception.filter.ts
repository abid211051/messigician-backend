import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../../generated/prisma/client.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const errors: Record<string, { status: number; message: string }> = {
        P2002: {
          status: 409,
          message: 'A record with this value already exists.',
        },
        P2003: {
          status: 400,
          message: 'The operation references an invalid record.',
        },
        P2025: {
          status: 404,
          message: 'The requested record was not found.',
        },
        P2034: {
          status: 409,
          message: 'A concurrent update occurred. Please retry.',
        },
      };

      const error = errors[exception.code];

      if (error) {
        status = error.status;
        message = error.message;
      } else {
        this.logger.error(
          `Unhandled Prisma error: ${exception.code}`,
          exception.stack,
        );
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();

      const body = exception.getResponse();

      message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ??
            exception.message);
    } else {
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      error: {
        message,
      },
    });
  }
}
