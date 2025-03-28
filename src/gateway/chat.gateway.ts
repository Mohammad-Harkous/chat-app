import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure securely in prod
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private onlineUsers = new Map<string, string>(); // userId -> socket.id

  constructor(private jwtService: JwtService) {}

  /**
   * Handle a new client connection.
   * @param client - The newly connected client
   *
   * This method is called automatically by the Nest framework when a new client
   * connects to the WebSocket server. It verifies the JWT token sent by the client
   * and if valid, records the client's socket.id in the onlineUsers map and
   * stores the user's ID in the client's data property. If the token is invalid,
   * it disconnects the client.
   */
  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    try {
      const payload = this.jwtService.verify(token);
      this.onlineUsers.set(payload.sub, client.id);
      client.data.userId = payload.sub;
      console.log(`User ${payload.sub} connected`);
    } catch (e) {
      console.log('Invalid token. Disconnecting...');
      client.disconnect();
    }
  }

  /**
   * Handle a client disconnection.
   * @param client - The disconnected client
   *
   * This method is called automatically by the Nest framework when a client
   * disconnects from the WebSocket server. It deletes the user's ID from the
   * onlineUsers map and prints a message to the console.
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.onlineUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('sendMessage')
  /**
   * Handle a message from a client.
   * @param data - The message data containing the recipient's ID and the message text
   * @param client - The client that sent the message
   *
   * This method is called automatically by the Nest framework when a client
   * sends a message to the WebSocket server. It verifies if the recipient is
   * online and if so, sends a 'newMessage' event to the recipient's socket with
   * the message text and the sender's ID. If the recipient is offline, it does
   * not send anything.
   */
  handleMessage(
    @MessageBody() data: { to: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const fromUserId = client.data.userId;
    const recipientSocketId = this.onlineUsers.get(data.to);

    if (recipientSocketId) {
      client.to(recipientSocketId).emit('newMessage', {
        from: fromUserId,
        message: data.message,
      });
    }
  }
}