import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import { ApiTags, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

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
}