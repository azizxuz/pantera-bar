import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers.authorization?.split(' ')[1];
    if (!auth) throw new UnauthorizedException();
    try { req.admin = this.jwt.verify(auth); return true; }
    catch { throw new UnauthorizedException(); }
  }
}
