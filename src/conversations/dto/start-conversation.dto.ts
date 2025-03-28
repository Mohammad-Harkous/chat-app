import { ApiProperty } from '@nestjs/swagger';

export class StartConversationDto {
  @ApiProperty({
    example: 'ce3bd2f7-7b22-43bb-b07c-8306e2c57a13',
    description: 'The ID of the user you want to start a conversation with',
  })
  userId: string;
}