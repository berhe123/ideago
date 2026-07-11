import { Injectable } from '@nestjs/common';
import { IdeaStage, IdeaStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import {
  generateBusinessModel,
  generateDesignBrief,
  generateProductPlan,
  generateValidation,
  IdeaInput,
} from '../../ai/blueprint.generator';
import { IdeaService } from '../idea/idea.service';
import { NotificationService } from '../notification/notification.service';
import {
  toBusinessModelDto,
  toDesignBriefDto,
  toProductPlanDto,
  toValidationDto,
} from './blueprint.mapper';

@Injectable()
export class BlueprintService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ideas: IdeaService,
    private readonly notifications: NotificationService,
  ) {}

  private toInput(idea: {
    id: string;
    title: string;
    problem: string;
    solution: string;
    targetMarket: string;
    category: string;
  }): IdeaInput {
    return {
      id: idea.id,
      title: idea.title,
      problem: idea.problem,
      solution: idea.solution,
      targetMarket: idea.targetMarket,
      category: idea.category,
    };
  }

  async getBlueprint(userId: string, ideaId: string, isAdmin = false) {
    await this.ideas.getOwned(userId, ideaId, isAdmin);
    const [validation, businessModel, productPlan, designBrief] = await Promise.all([
      this.prisma.validation.findUnique({ where: { ideaId } }),
      this.prisma.businessModel.findUnique({ where: { ideaId } }),
      this.prisma.productPlan.findUnique({ where: { ideaId } }),
      this.prisma.designBrief.findUnique({ where: { ideaId } }),
    ]);
    return {
      validation: validation ? toValidationDto(validation) : null,
      businessModel: businessModel ? toBusinessModelDto(businessModel) : null,
      productPlan: productPlan ? toProductPlanDto(productPlan) : null,
      designBrief: designBrief ? toDesignBriefDto(designBrief) : null,
    };
  }

  async generateValidation(userId: string, ideaId: string) {
    const idea = await this.ideas.getOwned(userId, ideaId);
    const gen = generateValidation(this.toInput(idea));

    const data = {
      startupScore: gen.startupScore,
      verdict: gen.verdict,
      marketSummary: gen.marketSummary,
      marketSizeUsd: BigInt(Math.round(gen.marketSizeUsd)),
      targetSegments: gen.targetSegments,
      competitors: gen.competitors,
      swot: gen.swot,
      risks: gen.risks,
      recommendations: gen.recommendations,
    };

    const record = await this.prisma.validation.upsert({
      where: { ideaId },
      create: { ideaId, ...data },
      update: data,
    });

    await this.prisma.idea.update({
      where: { id: ideaId },
      data: {
        startupScore: gen.startupScore,
        stage: idea.stage === IdeaStage.IDEA ? IdeaStage.VALIDATION : idea.stage,
        status: IdeaStatus.VALIDATED,
      },
    });

    await this.notifications.create(userId, {
      type: 'VALIDATION',
      title: 'Validation ready',
      body: `"${idea.title}" scored ${gen.startupScore}/100 — ${gen.verdict}`,
      link: `/ideas/${ideaId}`,
    });

    return toValidationDto(record);
  }

  async generateBusiness(userId: string, ideaId: string) {
    const idea = await this.ideas.getOwned(userId, ideaId);
    const gen = generateBusinessModel(this.toInput(idea));
    const record = await this.prisma.businessModel.upsert({
      where: { ideaId },
      create: { ideaId, ...gen },
      update: gen,
    });
    await this.advanceStage(ideaId, idea.stage, IdeaStage.PLANNING);
    return toBusinessModelDto(record);
  }

  async generateProduct(userId: string, ideaId: string) {
    const idea = await this.ideas.getOwned(userId, ideaId);
    const gen = generateProductPlan(this.toInput(idea));
    const record = await this.prisma.productPlan.upsert({
      where: { ideaId },
      create: { ideaId, ...gen },
      update: gen,
    });
    await this.advanceStage(ideaId, idea.stage, IdeaStage.PLANNING);
    return toProductPlanDto(record);
  }

  async generateDesign(userId: string, ideaId: string) {
    const idea = await this.ideas.getOwned(userId, ideaId);
    const gen = generateDesignBrief(this.toInput(idea));
    const record = await this.prisma.designBrief.upsert({
      where: { ideaId },
      create: { ideaId, ...gen },
      update: gen,
    });
    await this.advanceStage(ideaId, idea.stage, IdeaStage.DESIGN);
    return toDesignBriefDto(record);
  }

  async generateAll(userId: string, ideaId: string) {
    await this.generateValidation(userId, ideaId);
    await this.generateBusiness(userId, ideaId);
    await this.generateProduct(userId, ideaId);
    await this.generateDesign(userId, ideaId);
    return this.getBlueprint(userId, ideaId);
  }

  /** Moves the idea forward only if it hasn't already progressed past the target. */
  private async advanceStage(ideaId: string, current: IdeaStage, target: IdeaStage) {
    const order: IdeaStage[] = [
      IdeaStage.IDEA,
      IdeaStage.VALIDATION,
      IdeaStage.PLANNING,
      IdeaStage.DESIGN,
      IdeaStage.MVP,
      IdeaStage.DEVELOPMENT,
      IdeaStage.LAUNCH,
      IdeaStage.GROWTH,
    ];
    if (order.indexOf(current) < order.indexOf(target)) {
      await this.prisma.idea.update({ where: { id: ideaId }, data: { stage: target } });
    }
  }
}
