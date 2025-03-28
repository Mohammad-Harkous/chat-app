// src/users/users.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UsersService } from './users.service';

@ApiTags('Users') // Groups endpoints in Swagger UI
@ApiBearerAuth() // Indicates that the endpoints require authentication and  Required for Swagger to send the JWT
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  // Protected route
  @Get('me')
   @ApiResponse({
        status: 200,
        description: 'Returns a success message for authenticated users.',
        schema: {
          example: [
            {
              "message": "You are authenticated!",
              "user": {
                "id": 'user-uuid',
              },
            }
          ],
        },
      })
  @UseGuards(AuthGuard('jwt'))
  /**
   * Retrieves the profile of the authenticated user.
   * 
   * @param user - The authenticated user's details extracted from the JWT token.
   * @returns An object containing a message and the user's information.
   */
  getProfile(@GetUser() user: any) {
    return {
      message: 'You are authenticated!',
      user,
    };
  }

  @Get('search')
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'query', required: true, description: 'Username or email to search for' })
  @ApiResponse({
    status: 200,
    description: 'List of users matching the query',
    schema: {
      example: [
        {
          id: 'user-uuid',
          username: 'john_doe',
          isOnline: true,
          lastSeen: null
        }
      ],
    },
  })
  /**
   * Searches for users based on the provided query.
   * 
   * @param user - The authenticated user's details extracted from the JWT token.
   * @param query - The search term, which can be a username or email.
   * @returns An array of user objects that match the search criteria, each containing 
   *          the user's ID, username, online status, and last seen time.
   */

  async searchUsers(
    @GetUser() user: { userId: string },
    @Query('query') query: string,
  ) {
    const results = await this.usersService.searchUsers(query, user.userId);

    return results.map((u) => ({
      id: u.id,
      username: u.username,
      isOnline: u.isOnline,
      lastSeen: u.lastSeen,
    }));
  }

}