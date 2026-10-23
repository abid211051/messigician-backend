import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import type { Response } from 'express';
import { ErrorDetail, ErrorResponse } from '../core.types.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: ErrorDetail[] | undefined;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaErrors: Record<
        string,
        { status: HttpStatus; message: string }
      > = {
        P2002: {
          status: HttpStatus.CONFLICT,
          message: 'A record with this value already exists.',
        },
        P2003: {
          status: HttpStatus.BAD_REQUEST,
          message: 'The operation references an invalid record.',
        },
        P2025: {
          status: HttpStatus.NOT_FOUND,
          message: 'The requested record was not found.',
        },
        P2034: {
          status: HttpStatus.CONFLICT,
          message: 'A concurrent update occurred. Please retry.',
        },
      };

      const mappedError = prismaErrors[exception.code];

      if (mappedError) {
        status = mappedError.status;
        message = mappedError.message;
      } else {
        this.logger.error(
          `Unhandled Prisma error: ${exception.code}`,
          exception.stack,
        );
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();

      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const errorBody = body as {
          message?: string | string[];
          details?: ErrorDetail[];
        };

        if (typeof errorBody.message === 'string') {
          message = errorBody.message;
        } else if (Array.isArray(errorBody.message)) {
          details = errorBody.message.map((item) => ({
            message: item,
          }));
          message = 'Validation failed';
        }

        if (Array.isArray(errorBody.details)) {
          details = errorBody.details;
        }
      }
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message,
        ...(details?.length ? { details } : {}),
      },
    };

    response.status(status).json(errorResponse);
  }
}
