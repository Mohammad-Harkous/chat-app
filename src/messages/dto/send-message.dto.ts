import { ApiProperty } from "@nestjs/swagger";

export class SendMessageDto {
  @ApiProperty({ example: 'conversation-uuid-here' })
  conversationId: string;
  @ApiProperty({ example: 'Hello, how are you?' })
  content: string;
}