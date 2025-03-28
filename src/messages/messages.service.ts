// src/messages/messages.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../messages/entities/message.entity';
import { Repository } from 'typeorm';
import { ConversationsService } from '../conversations/conversations.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly conversationsService: ConversationsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Sends a message in a conversation.
   *
   * @param conversationId The ID of the conversation to send the message in.
   * @param senderId The ID of the user sending the message.
   * @param content The content of the message.
   * @returns The newly created message.
   * @throws {NotFoundException} If the conversation is not found.
   * @throws {ForbiddenException} If the sender is not a participant in the conversation.
   * @throws {NotFoundException} If the sender is not found.
   */
  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    // 1. Find conversation and ensure it exists
    const conversation = await this.conversationsService.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found.');

    // 2. Ensure sender is a participant
    const isParticipant =
      conversation.participant1.id === senderId || conversation.participant2.id === senderId;
    if (!isParticipant) throw new ForbiddenException('You are not a participant in this conversation.');

    // 3. Get sender user
    const sender = await this.usersService.findById(senderId);
    if (!sender) throw new NotFoundException('Sender not found.');

    // 4. Create and save message
    const message = this.messageRepository.create({
      content,
      sender,
      conversation,
      isRead: false,
    });

    const savedMessage = await this.messageRepository.save(message);

    // 5. Update conversation's lastMessageAt
    conversation.lastMessageAt = new Date();
    await this.conversationsService.update(conversation);

    return savedMessage;
  }

  async getMessagesForConversation(conversationId: string, userId: string): Promise<Message[]> {
    // 1. Verify the conversation exists
    const conversation = await this.conversationsService.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found.');
  
    // 2. Check if the user is a participant
    const isParticipant =
      conversation.participant1.id === userId || conversation.participant2.id === userId;
    if (!isParticipant) throw new ForbiddenException('You are not a participant in this conversation.');
  
    // 3. Fetch messages sorted by creation date (ASC = oldest to newest)
    return this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'ASC' },
      relations: ['sender'], // Ensure sender is loaded
    });
  }
}