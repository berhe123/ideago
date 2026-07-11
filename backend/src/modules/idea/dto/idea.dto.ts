import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { IDEA_STAGE, IDEA_STATUS } from '../../../shared';

const STAGES = Object.values(IDEA_STAGE);
const STATUSES = Object.values(IDEA_STATUS);

export class CreateIdeaDto {
  @ApiProperty({ example: 'Snap — AI receipts for freelancers' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'Freelancers waste hours tracking receipts and expenses.' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  problem!: string;

  @ApiProperty({ example: 'A mobile app that scans receipts and auto-categorizes expenses with AI.' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  solution!: string;

  @ApiProperty({ example: 'Independent freelancers and solo consultants' })
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  targetMarket!: string;

  @ApiProperty({ example: 'Fintech' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  category!: string;
}

export class UpdateIdeaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  problem?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  solution?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  targetMarket?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @ApiPropertyOptional({ enum: STAGES })
  @IsOptional()
  @IsIn(STAGES)
  stage?: string;

  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES)
  status?: string;
}

export class IdeaQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize = 12;

  @ApiPropertyOptional({ enum: STAGES })
  @IsOptional()
  @IsIn(STAGES)
  stage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;
}
