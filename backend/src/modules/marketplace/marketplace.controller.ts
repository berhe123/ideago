import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateHireRequestDto,
  ExpertQueryDto,
  RespondHireDto,
  UpsertExpertDto,
} from './dto/marketplace.dto';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplace: MarketplaceService) {}

  @Public()
  @Get('experts')
  listExperts(@Query() query: ExpertQueryDto) {
    return this.marketplace.listExperts(query);
  }

  @Public()
  @Get('experts/:id')
  getExpert(@Param('id') id: string) {
    return this.marketplace.getExpert(id);
  }

  @ApiBearerAuth()
  @Get('me/expert')
  myProfile(@CurrentUser('id') userId: string) {
    return this.marketplace.myProfile(userId);
  }

  @ApiBearerAuth()
  @Put('me/expert')
  upsertProfile(@CurrentUser('id') userId: string, @Body() dto: UpsertExpertDto) {
    return this.marketplace.upsertProfile(userId, dto);
  }

  @ApiBearerAuth()
  @Post('hire')
  hire(@CurrentUser('id') userId: string, @Body() dto: CreateHireRequestDto) {
    return this.marketplace.hire(userId, dto);
  }

  @ApiBearerAuth()
  @Get('requests/sent')
  sent(@CurrentUser('id') userId: string) {
    return this.marketplace.myHireRequests(userId);
  }

  @ApiBearerAuth()
  @Get('requests/incoming')
  incoming(@CurrentUser('id') userId: string) {
    return this.marketplace.incomingHireRequests(userId);
  }

  @ApiBearerAuth()
  @Patch('requests/:id')
  respond(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RespondHireDto,
  ) {
    return this.marketplace.respond(userId, id, dto);
  }
}
