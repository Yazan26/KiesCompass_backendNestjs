import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Presentation Layer - Current User Decorator
 * Extracts the authenticated user from the request
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
