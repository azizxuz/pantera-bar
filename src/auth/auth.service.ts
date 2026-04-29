import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(email: string, password: string) {
    const a = await this.prisma.admin.findUnique({ where: { email } });
    if (!a || !(await bcrypt.compare(password, a.password)))
      throw new UnauthorizedException();
    return {
      access_token: await this.jwt.signAsync({
        sub: a.id,
        email: a.email,
        role: "admin",
      }),
    };
  }
}
