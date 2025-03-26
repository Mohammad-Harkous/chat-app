import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConversationsModule } from './conversations/conversations.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load .env file globally
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    autoLoadEntities: true, // Automatically load entities
    synchronize: true, // Sync database schema (Only for development)
    }), 
    UsersModule,
    AuthModule,
    ConversationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
