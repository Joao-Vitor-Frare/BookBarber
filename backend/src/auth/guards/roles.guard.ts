import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const publico = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (publico) return true;

    const request = context.switchToHttp().getRequest();
    const url = String(request.originalUrl || request.url || '');

    // Estas rotas trabalham sempre com o usuário autenticado do JWT.
    // O JwtAuthGuard global continua exigindo login antes deste guard rodar,
    // então não há exposição de reservas de terceiros.
    if (
      url.startsWith('/api/agendamentos/minhas') ||
      url.startsWith('/agendamentos/minhas') ||
      url.startsWith('/api/agendamentos/reservar') ||
      url.startsWith('/agendamentos/reservar')
    ) {
      return true;
    }

    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const perfilUsuario = String(request.user?.perfil || '').trim().toUpperCase();
    const rolesPermitidas = roles.map((role) => String(role).trim().toUpperCase());

    if (!request.user || !rolesPermitidas.includes(perfilUsuario)) {
      throw new ForbiddenException('Você não tem permissão para acessar esta área');
    }

    return true;
  }
}
