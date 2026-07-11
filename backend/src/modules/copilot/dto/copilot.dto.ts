import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AskCopilotDto {
  @ApiProperty({ example: 'How should I price this product?' })
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  content!: string;
}
