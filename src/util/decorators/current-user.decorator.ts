import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Utility - Current User Decorator
 * Extracts current authenticated user from request
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
