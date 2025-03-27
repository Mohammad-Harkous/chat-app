import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
  } from 'typeorm';
  import { Conversation } from '../.././conversations/entities/conversation.entity';
  import { User } from '../../users/entities/user.entity';
  
  @Entity()
  export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column('text')
    content: string;
  
    @Column({ default: false })
    isRead: boolean;
  
    @ManyToOne(() => User, { eager: true })
    sender: User;
  
    @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
    conversation: Conversation;
  
    @CreateDateColumn()
    createdAt: Date;
  }