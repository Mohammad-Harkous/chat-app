import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
  } from '@nestjs/common';
  import { ConversationsService } from './conversations.service';
  import { AuthGuard } from '@nestjs/passport';
  import { GetUser } from 'src/common/decorators/get-user.decorator';
  import { StartConversationDto } from './dto/start-conversation.dto';
  import { ApiBody, ApiResponse } from '@nestjs/swagger';
  
  @Controller('conversations')
  export class ConversationsController {
    constructor(private readonly conversationsService: ConversationsService) {}
  
    // POST /conversations/start
    @Post('start')
    @ApiBody({ type: StartConversationDto })
    @ApiResponse({ status: 201, description: 'Creates or returns an existing conversation with the target user.' })
    @UseGuards(AuthGuard('jwt'))// ✅ Protects the route
    async startConversation(
      @GetUser() user: { userId: string },// ✅ From JWT
      @Body() dto: StartConversationDto,
    ) {
      return this.conversationsService.createOrGetConversation(
        user.userId,
        dto.userId,
      );
    }

  

    @Get()
    @ApiResponse({
      status: 200,
      description: 'Returns all conversations the authenticated user is part of.',
      schema: {
        example: [
          {
            id: '09a4aaf0-fb3d-4004-a2b1-a28b8c2d2534',
            participant1: {
              id: 'user-id-1',
              username: 'john_doe',
              isOnline: false,
              lastSeen: null,
            },
            participant2: {
              id: 'user-id-2',
              username: 'sarah',
              isOnline: true,
              lastSeen: '2025-03-27T20:00:00.000Z',
            },
            lastMessageAt: '2025-03-27T20:49:42.964Z',
            createdAt: '2025-03-26T11:32:09.915Z',
            updatedAt: '2025-03-26T11:32:09.915Z',
          },
        ],
      },
    })
    @UseGuards(AuthGuard('jwt'))
    /**
     * Retrieves all conversations for the authenticated user.
     * 
     * @param user - The authenticated user's details extracted from the JWT token.
     * @returns An array of sanitized conversation objects, where each object includes
     *          participant information such as ID, username, online status, and last seen time,
     *          without sensitive data like passwords or emails.
     */
    async getMyConversations(@GetUser() user: { userId: string }) {
    const conversations = await this.conversationsService.getAllConversationsForUser(user.userId);

    // Sanitize participants (remove password/email/etc.)
    return conversations.map((convo) => {
        const { participant1, participant2, ...rest } = convo;

        return {
        ...rest,
        participant1: {
            id: participant1.id,
            username: participant1.username,
            isOnline: participant1.isOnline,
            lastSeen: participant1.lastSeen,
        },
        participant2: {
            id: participant2.id,
            username: participant2.username,
            isOnline: participant2.isOnline,
            lastSeen: participant2.lastSeen,
        },
        };
    });
    }
}