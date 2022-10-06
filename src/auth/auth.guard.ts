import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from 'src/auth/role.decorator';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const roles = this.reflector.get<AllowedRoles[]>(
        'roles',
        context.getHandler(),
      );

      // public endpoint
      if (!roles) return true;

      const gqlContext = GqlExecutionContext.create(context).getContext();
      const token = gqlContext.token;
      console.log({ token });

      if (!token) return false;

      const decoded = this.jwtService.verify(token.toString());

      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const userId = decoded['id'];
        const { user } = await this.usersService.findById(userId);

        // private endpoint
        if (!user) return false;

        gqlContext['user'] = user;

        // private endpoint with any role
        if (roles.includes('Any')) return true;

        // authorization by role
        return roles.includes(user.role);
      }

      return false;
    } catch (error) {
      return false;
    }
  }
}
