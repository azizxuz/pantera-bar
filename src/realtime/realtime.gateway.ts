import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/realtime', cors: { origin: '*' } })
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;
  constructor(private jwt: JwtService) {}

  handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token as string | undefined;
    if (token) {
      try {
        const payload = this.jwt.verify(token);
        if (payload?.role === 'admin') socket.join('admin');
      } catch { /* anonymous client allowed */ }
    }
  }

  emitNew(order: any)    { this.server.to('admin').emit('order:new', order); }
  emitUpdate(order: any) { this.server.to('admin').emit('order:update', order); }
}
