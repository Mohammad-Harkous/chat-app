import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

  /**
   * Validates the user's login credentials.
   * 
   * @param email - The email of the user attempting to log in.
   * @param password - The password provided by the user.
   * @returns The user object if validation is successful.
   * @throws UnauthorizedException if the credentials are invalid.
   */
  async validateUser(email: string, password: string) {
    // Find the user by email
    const user = await this.usersService.findByEmail(email);

    // If user not found, throw exception
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare provided password with stored password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    // If passwords do not match, throw exception
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return the user object if validation succeeds
    return user;
  }

  /**
   * Authenticates the user by validating their credentials.
   * 
   * @param email - The email of the user attempting to log in.
   * @param password - The password provided by the user.
   * @returns An object containing the user's data without the password, but with a JWT token.
   * @throws UnauthorizedException if the credentials are invalid.
   */
  async login(email: string, password: string) {
    // Validate user credentials
    const user = await this.validateUser(email, password);

    // Create a payload for the JWT token (containing the user's ID)
    const payload = { sub: user.id }; // 'sub' = subject of the token

    // Sign the payload with the JWT secret
    const token = await this.jwtService.signAsync(payload);

    // Return user data + token (without password)
    const { password: _, ...userWithoutPassword } = user;
    return {
      // Return the user's data without the password
      user: userWithoutPassword,
      // Return the JWT token
      accessToken: token,
    };
  }
}
