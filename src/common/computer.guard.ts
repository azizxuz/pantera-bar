import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ComputerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = req.headers['x-computer-token'];
    if (!token) throw new UnauthorizedException('Missing computer token');
    const c = await this.prisma.computer.findUnique({ where: { token } });
    if (!c || !c.enabled || c.tokenExpiresAt < new Date()) throw new UnauthorizedException();
    req.computer = c;
    return true;
  }
}
