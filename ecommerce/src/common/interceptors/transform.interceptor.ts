import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        const isWrapped = data && typeof data === 'object' && 'data' in data && 'success' in data;
        if (isWrapped) return data;

        return {
          success: true,
          statusCode: response.statusCode,
          data: data?.data !== undefined ? data.data : data,
          message: data?.message,
          meta: data?.meta,
        };
      }),
    );
  }
}
