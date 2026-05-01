import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGuard } from '../common/admin.guard';
const tok = () => randomBytes(24).toString('hex');
const yearFromNow = () => { const d = new Date(); d.setFullYear(d.getFullYear()+1); return d; };

@Controller('computers')
// @UseGuards(AdminGuard)
export class ComputersController {
  constructor(private prisma: PrismaService) {}
  @Get() list() { return this.prisma.computer.findMany({ orderBy: { number: 'asc' } }); }
  @Post() async add() {
    const max = await this.prisma.computer.aggregate({ _max: { number: true } });
    return this.prisma.computer.create({
      data: { number: (max._max.number ?? 0) + 1, token: tok(), tokenExpiresAt: yearFromNow() },
    });
  }
  @Post(':id/rotate') rotate(@Param('id') id: string) {
    return this.prisma.computer.update({ where: { id }, data: { token: tok(), tokenExpiresAt: yearFromNow() } });
  }
  @Patch(':id') update(@Param('id') id: string, @Body() body: { enabled?: boolean }) {
    return this.prisma.computer.update({ where: { id }, data: body });
  }
  @Delete(':id') del(@Param('id') id: string) { return this.prisma.computer.delete({ where: { id } }); }
}
