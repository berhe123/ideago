import { Module } from '@nestjs/common';
import { BlueprintService } from './blueprint.service';
import { BlueprintController } from './blueprint.controller';
import { IdeaModule } from '../idea/idea.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [IdeaModule, NotificationModule],
  providers: [BlueprintService],
  controllers: [BlueprintController],
})
export class BlueprintModule {}
