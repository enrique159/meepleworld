import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import type { Response } from 'express'
import type { AuthenticatedRequest } from './request-context.js'

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp()
    const request = http.getRequest<AuthenticatedRequest>()
    const response = http.getResponse<Response>()
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const body = exception instanceof HttpException ? exception.getResponse() : undefined
    const code = getCode(status, body)
    const message = getMessage(status, body)

    response.status(status).json({
      code,
      message,
      requestId: request.requestId ?? 'unknown',
    })
  }
}

function getCode(status: number, body: string | object | undefined): string {
  if (typeof body === 'object' && body !== null && 'code' in body && typeof body.code === 'string') return body.code
  switch (status) {
    case HttpStatus.BAD_REQUEST: return 'INVALID_INPUT'
    case HttpStatus.UNAUTHORIZED: return 'UNAUTHENTICATED'
    case HttpStatus.FORBIDDEN: return 'FORBIDDEN'
    case HttpStatus.NOT_FOUND: return 'NOT_FOUND'
    case HttpStatus.CONFLICT: return 'CONFLICT'
    case HttpStatus.SERVICE_UNAVAILABLE: return 'SERVICE_UNAVAILABLE'
    default: return status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED'
  }
}

function getMessage(status: number, body: string | object | undefined): string {
  if (typeof body === 'string') return body
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = body.message
    if (typeof message === 'string') return message
    if (Array.isArray(message)) return message.map(String).join(' ')
  }
  return status >= 500 ? 'Ocurrió un error interno.' : 'No se pudo completar la solicitud.'
}
