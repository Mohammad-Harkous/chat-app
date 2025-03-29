import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConversationsService } from 'src/conversations/conversations.service';
import { MessagesService } from 'src/messages/messages.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure securely in prod
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private onlineUsers = new Map<string, string>(); // userId -> socket.id

  constructor(
    private jwtService: JwtService,
    private conversationsService: ConversationsService,
    private messagesService: MessagesService,
  ) {}


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

      // 🔥 Broadcast to all connected clients that this user is now online
      this.server.emit('userStatus', {
        userId: payload.sub,
        status: 'online',
      });
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

      // 🔥 Broadcast to all connected clients that this user is now offline
      this.server.emit('userStatus', {
        userId,
        status: 'offline',
      });
    }
  }

// ✅ Syncing messages sent via Socket.IO with your database
// (no need to use the REST POST /messages anymore — everything will go live + persistent!)
  @SubscribeMessage('sendMessage')
  /**
   * Handle a 'sendMessage' event from a client.
   * @param data - The payload from the client, containing the conversation ID and message content
   * @param client - The client that sent the message
   *
   * This method is called automatically by the Nest framework when a client
   * sends a 'sendMessage' event to the WebSocket server. It saves the message
   * to the database using an existing service, finds the recipient from the
   * conversation, and sends the message to the recipient if they are online.
   * It also sends a confirmation to the sender.
   */
  async handleMessage(
    @MessageBody() data: { conversationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const fromUserId = client.data.userId;

    try {
      // 1. Save message to DB using existing service
      const savedMessage = await this.messagesService.sendMessage(
        data.conversationId,
        fromUserId,
        data.content,
      );

      // 2. Find recipient from conversation
      const conversation = await this.conversationsService.findById(data.conversationId);
      if (!conversation) return;

      const recipientId =
        conversation.participant1.id === fromUserId
          ? conversation.participant2.id
          : conversation.participant1.id;

      // 3. Send message to recipient (if online)
      const recipientSocketId = this.onlineUsers.get(recipientId);
      if (recipientSocketId) {
        this.server.to(recipientSocketId).emit('newMessage', {
          id: savedMessage.id,
          content: savedMessage.content,
          conversationId: conversation.id,
          sender: {
            id: fromUserId,
            username: savedMessage.sender.username,
          },
          createdAt: savedMessage.createdAt,
        });
      }

      // 4. Also emit to sender (to confirm UI)
      client.emit('newMessage', {
        id: savedMessage.id,
        content: savedMessage.content,
        conversationId: conversation.id,
        sender: {
          id: fromUserId,
          username: savedMessage.sender.username,
        },
        createdAt: savedMessage.createdAt,
      });
    } catch (error) {
      console.error('[Socket Message Error]', error.message);
    }
  }
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('typing')
  /**
   * Handle a 'typing' event from a client.
   * @param data - The conversation ID where the user is typing
   * @param client - The client that sent the message
   *
   * This method is called automatically by the Nest framework when a client
   * sends a 'typing' event to the WebSocket server. It sends a 'userTyping'
   * event to the other participant in the conversation, if they are online.
   */
  async handleTyping(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const fromUserId = client.data.userId;

    // 1. Get conversation
    const conversation = await this.conversationsService.findById(data.conversationId);
    if (!conversation) return;

    // 2. Find the other participant
    const otherUserId =
      conversation.participant1.id === fromUserId
        ? conversation.participant2.id
        : conversation.participant1.id;

    const recipientSocketId = this.onlineUsers.get(otherUserId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('userTyping', {
        from: fromUserId,
        conversationId: data.conversationId,
      });
    }
  }

}