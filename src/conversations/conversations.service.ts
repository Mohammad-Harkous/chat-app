import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository, Not } from 'typeorm';
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

  /**
   * Retrieves all conversations for a given user, excluding any that the user has deleted.
   * The conversations are ordered with the most recent messages first.
   * @param userId The ID of the user to fetch conversations for.
   * @returns An array of conversations that the user is a participant in.
   */
  async getAllConversationsForUser(userId: string): Promise<Conversation[]> {
    // 1. Define the conditions for finding conversations:
    //    - The user is either participant1 or participant2.
    //    - The conversation has not been deleted by the user.
    return this.conversationRepository.find({
      where: [
        {
          participant1: { id: userId },
          deletedByUserId: Not(userId), // Exclude conversations deleted by the user
        },
        {
          participant2: { id: userId },
          deletedByUserId: Not(userId), // Exclude conversations deleted by the user
        },
      ],
      // 2. Order the conversations by the most recent message first
      order: {
        lastMessageAt: 'DESC', // Most recent chats first
      },
    });
  }

  /**
   * Finds a conversation by its ID.
   * 
   * @param id The ID to search for.
   * @returns The conversation if found, otherwise `null`.
   */
  async findById(id: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({ where: { id } });
  }
  
  /**
   * Updates a conversation in the database.
   * 
   * @param convo - The conversation to update.
   * @returns The updated conversation.
   */
  async update(convo: Conversation): Promise<Conversation> {
    return this.conversationRepository.save(convo);
  }

/**
 * Soft deletes a conversation for a specific user by marking it as deleted.
 *
 * This operation does not remove the conversation from the database, but
 * records which user has deleted the conversation. It ensures that the
 * user is a participant in the conversation before marking it as deleted.
 *
 * @param conversationId - The ID of the conversation to be soft deleted.
 * @param userId - The ID of the user attempting to delete the conversation.
 * @returns An object indicating success.
 * @throws {NotFoundException} If the conversation is not found.
 * @throws {ForbiddenException} If the user is not a participant in the conversation.
 */

  async softDeleteForUser(conversationId: string, userId: string): Promise<{ success: boolean }> {
    const convo = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
  
    if (!convo) throw new NotFoundException('Conversation not found');
  
    // Make sure user is a participant
    if (
      convo.participant1.id !== userId &&
      convo.participant2.id !== userId
    ) {
      throw new ForbiddenException('Not part of this conversation');
    }
  
    // Save who deleted the chat
    convo.deletedByUserId = userId;
    await this.conversationRepository.save(convo);
  
    return { success: true };
  }
}