import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
  } from 'typeorm';
  import { User } from '../../users/entities/user.entity';
  
  @Entity()
  @Unique(['participant1', 'participant2']) // Ensure one conversation per pair
  export class Conversation {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User, { eager: true })
    participant1: User;
  
    @ManyToOne(() => User, { eager: true })
    participant2: User;
  
    @Column({ type: 'timestamp', nullable: true })
    lastMessageAt: Date;

    @Column({ nullable: true })
    deletedByUserId: string; // stores the user who deleted it
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }