import { Module } from '@nestjs/common';
import { CopilotService } from './copilot.service';
import { CopilotController } from './copilot.controller';
import { IdeaModule } from '../idea/idea.module';

@Module({
  imports: [IdeaModule],
  providers: [CopilotService],
  controllers: [CopilotController],
})
export class CopilotModule {}
