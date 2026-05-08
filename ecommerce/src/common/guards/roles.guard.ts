import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    const userRole = user?.role?.slug;

    if (!userRole) throw new ForbiddenException('Access denied');

    const permissions: string[] = user?.role?.permissions || [];
    const hasWildcard = permissions.includes('*');
    const hasRole = requiredRoles.some((r) => userRole === r);

    if (!hasWildcard && !hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
