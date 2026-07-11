import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IdeaService } from './idea.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateIdeaDto, IdeaQueryDto, UpdateIdeaDto } from './dto/idea.dto';

@ApiTags('ideas')
@ApiBearerAuth()
@Controller('ideas')
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateIdeaDto) {
    return this.ideaService.create(userId, dto);
  }

  @Get()
  list(@CurrentUser('id') userId: string, @Query() query: IdeaQueryDto) {
    return this.ideaService.list(userId, query);
  }

  @Get(':id')
  detail(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.ideaService.detail(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateIdeaDto,
  ) {
    return this.ideaService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.ideaService.remove(userId, id);
  }
}
