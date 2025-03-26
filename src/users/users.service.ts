import { Injectable, ConflictException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        //  injects the User repository (connected to DB).
        @InjectRepository(User)
        private readonly userRepository:  Repository<User>,
    ) {}

    // Register a new user
    async createUser(username: string, email: string, password: string): Promise<Omit<User, 'password'>>{
        const existingUser = await this.userRepository.findOne({
            where: [{ email }, { username }],
        });

        if (existingUser) {
            throw new ConflictException('Username or email already exists');
        }
        
        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = this.userRepository.create({
            username,
            email,
            password: hashedPassword,
        });

        const savedUser = await this.userRepository.save(newUser);

        // Remove password before returning user
        const { password: _, ...userWithoutPassword} = savedUser;
        return userWithoutPassword;
    }

    /**
     * Finds a user by their email.
     *
     * @param email The email to search for.
     * @returns The user if found, otherwise `null`.
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    /**
     * Finds a user by their ID.
     *
     * @param id The ID to search for.
     * @returns The user if found, otherwise `null`.
     */
    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }
  
}
