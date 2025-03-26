import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class User {
    @PrimaryGeneratedColumn('uuid') // Generates UUIDs automatically
    id: string;
  
    @Column({ unique: true })
    username: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string; // Will be hashed using bcrypt
  
    @Column({ default: false })
    isOnline: boolean;
  
    @Column({ type: 'timestamp', nullable: true })
    lastSeen: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }