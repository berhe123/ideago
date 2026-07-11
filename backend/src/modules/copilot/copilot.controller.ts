import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CopilotService } from './copilot.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AskCopilotDto } from './dto/copilot.dto';

@ApiTags('copilot')
@ApiBearerAuth()
@Controller('ideas/:ideaId/copilot')
export class CopilotController {
  constructor(private readonly copilot: CopilotService) {}

  @Get()
  history(@CurrentUser('id') userId: string, @Param('ideaId') ideaId: string) {
    return this.copilot.history(userId, ideaId);
  }

  @Post()
  ask(
    @CurrentUser('id') userId: string,
    @Param('ideaId') ideaId: string,
    @Body() dto: AskCopilotDto,
  ) {
    return this.copilot.ask(userId, ideaId, dto.content);
  }
}
