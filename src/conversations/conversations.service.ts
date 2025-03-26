import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly usersService: UsersService,
  ) {}

  // Main function: Find or create a conversation between two users
  async createOrGetConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    // Step 1: Prevent user chatting with themselves
    if (user1Id === user2Id) {
      throw new Error('You cannot chat with yourself.');
    }

    // Step 2: Always check both participant orders
    let conversation = await this.conversationRepository.findOne({
      where: [
        { participant1: { id: user1Id }, participant2: { id: user2Id } },
        { participant1: { id: user2Id }, participant2: { id: user1Id } },
      ],
    });

    // Step 3: If found, return it
    if (conversation) {
      return conversation;
    }

    // Step 4: Otherwise, fetch user entities from DB
    const user1 = await this.usersService.findById(user1Id);
    const user2 = await this.usersService.findById(user2Id);

    if (!user1 || !user2) {
      throw new Error('One or both users not found.');
    }

    // Step 5: Create and save new conversation
    conversation = this.conversationRepository.create({
      participant1: user1,
      participant2: user2,
    });

    return this.conversationRepository.save(conversation);
  }

  async getAllConversationsForUser(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: [
        { participant1: { id: userId } },
        { participant2: { id: userId } },
      ],
      order: {
        lastMessageAt: 'DESC', // Most recent chats first
      },
    });
  }
}