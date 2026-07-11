import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EXPERT_CATEGORY, HIRE_STATUS } from '../../../shared';

const CATEGORIES = Object.values(EXPERT_CATEGORY);

export class UpsertExpertDto {
  @ApiProperty({ enum: CATEGORIES })
  @IsIn(CATEGORIES)
  category!: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(120)
  headline!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  bio!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  skills!: string[];

  @ApiProperty({ example: 75 })
  @IsInt()
  @Min(0)
  hourlyRateUsd!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}

export class ExpertQueryDto {
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

  @ApiPropertyOptional({ enum: CATEGORIES })
  @IsOptional()
  @IsIn(CATEGORIES)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;
}

export class CreateHireRequestDto {
  @ApiProperty()
  @IsString()
  expertId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ideaId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  message!: string;
}

export class RespondHireDto {
  @ApiProperty({ enum: Object.values(HIRE_STATUS) })
  @IsIn(Object.values(HIRE_STATUS))
  status!: string;
}
