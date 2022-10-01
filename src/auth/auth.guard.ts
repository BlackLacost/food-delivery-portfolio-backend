import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { AllowedRoles } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<AllowedRoles[]>(
      'roles',
      context.getHandler(),
    );

    // public endpoint
    if (!roles) return true;

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext.user;

    // private endpoint
    if (!user) return false;

    // private endpoint with any role
    if (roles.includes('Any')) return true;

    // authorization by role
    return roles.includes(user.role);
  }
}
