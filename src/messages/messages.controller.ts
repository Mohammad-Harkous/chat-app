import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import { ApiTags, ApiBearerAuth, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 201, description: 'Sends a message in a specific conversation.' })
  @UseGuards(AuthGuard('jwt'))
  /**
   * Handles sending a message within a conversation.
   *
   * @param user - The authenticated user's details extracted from the JWT token.
   * @param sendMessageDto - The data transfer object containing the conversation ID and message content.
   * @returns An object representing the newly sent message, including sanitized sender and conversation details.
   * @throws {NotFoundException} If the conversation or sender is not found.
   * @throws {ForbiddenException} If the sender is not a participant in the conversation.
   */

  async sendMessage(
    @GetUser() user: { userId: string },
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const message = await this.messagesService.sendMessage(
      sendMessageDto.conversationId,
      user.userId,
      sendMessageDto.content,
    );
  
    const cleanSender = {
      id: message.sender.id,
      username: message.sender.username,
      isOnline: message.sender.isOnline,
      lastSeen: message.sender.lastSeen,
    };
  
    const cleanConversation = {
      id: message.conversation.id,
      participant1: {
        id: message.conversation.participant1.id,
        username: message.conversation.participant1.username,
        isOnline: message.conversation.participant1.isOnline,
        lastSeen: message.conversation.participant1.lastSeen,
      },
      participant2: {
        id: message.conversation.participant2.id,
        username: message.conversation.participant2.username,
        isOnline: message.conversation.participant2.isOnline,
        lastSeen: message.conversation.participant2.lastSeen,
      },
      lastMessageAt: message.conversation.lastMessageAt,
      createdAt: message.conversation.createdAt,
      updatedAt: message.conversation.updatedAt,
    };
  
    return {
      id: message.id,
      content: message.content,
      isRead: message.isRead,
      sender: cleanSender,
      conversation: cleanConversation,
      createdAt: message.createdAt,
    };
  }

  /**
   * Retrieves all messages in a specific conversation.
   *
   * @param user - The authenticated user's details extracted from the JWT token.
   * @param conversationId - The ID of the conversation to fetch messages from.
   * @returns An array of messages in the conversation, sorted by creation date.
   * @throws {NotFoundException} If the conversation is not found.
   * @throws {ForbiddenException} If the user is not a participant in the conversation.
   */
  @Get(':conversationId')
  @ApiParam({ name: 'conversationId', required: true, description: 'The ID of the conversation' })
  @ApiResponse({
    status: 200,
    description: 'Returns all messages in a conversation, sorted by time',
    schema: {
      example: [
        {
          id: 'message-uuid',
          content: 'Hey there!',
          isRead: false,
          sender: {
            id: 'user-id',
            username: 'john_doe',
            isOnline: false,
            lastSeen: null,
          },
          createdAt: '2025-03-27T20:49:42.964Z',
        },
      ],
    },
  })
  @UseGuards(AuthGuard('jwt'))
  async getMessages(
    @GetUser() user: { userId: string },
    @Param('conversationId') conversationId: string,
  ) {
    const messages = await this.messagesService.getMessagesForConversation(conversationId, user.userId);

    // Sanitize sender data
    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      sender: {
        id: msg.sender.id,
        username: msg.sender.username,
        isOnline: msg.sender.isOnline,
        lastSeen: msg.sender.lastSeen,
      },
    }));
  }
}
