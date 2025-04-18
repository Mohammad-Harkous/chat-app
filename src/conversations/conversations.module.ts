import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { Conversation } from './entities/conversation.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation]), UsersModule],
  providers: [ConversationsService],
  controllers: [ConversationsController],
  exports: [ConversationsService]
})
export class ConversationsModule {}
