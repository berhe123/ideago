import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BlueprintService } from './blueprint.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('blueprint')
@ApiBearerAuth()
@Controller('ideas/:ideaId/blueprint')
export class BlueprintController {
  constructor(private readonly blueprint: BlueprintService) {}

  @Get()
  get(@CurrentUser('id') userId: string, @Param('ideaId') ideaId: string) {
    return this.blueprint.getBlueprint(userId, ideaId);
  }

  @Post('validation')
  validation(@CurrentUser('id') userId: string, @Param('ideaId') ideaId: string) {
    return this.blueprint.generateValidation(userId, ideaId);
  }

  @Post('business')
  business(@CurrentUser('id') userId: string, @Param('ideaId') ideaId: string) {
    return this.blueprint.generateBusiness(userId, ideaId);
  }

  @Post('product')
  product(@CurrentUser('id') userId: string, @Param('ideaId') ideaId: string) {
    return this.blueprint.generateProduct(userId, ideaId);
  }

  @Post('design')
  design(@CurrentUser('id') userId: string, @Param('ideaId') ideaId: string) {
    return this.blueprint.generateDesign(userId, ideaId);
  }

  @Post('generate-all')
  generateAll(@CurrentUser('id') userId: string, @Param('ideaId') ideaId: string) {
    return this.blueprint.generateAll(userId, ideaId);
  }
}
