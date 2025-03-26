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
  
  @Controller('conversations')
  export class ConversationsController {
    constructor(private readonly conversationsService: ConversationsService) {}
  
    // POST /conversations/start
    @Post('start')
    @UseGuards(AuthGuard('jwt')) // ✅ Protects the route
    async startConversation(
      @GetUser() user: { userId: string }, // ✅ From JWT
      @Body('userId') otherUserId: string,
    ) {
      return this.conversationsService.createOrGetConversation(
        user.userId,
        otherUserId,
      );
    }

  

    @Get()
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