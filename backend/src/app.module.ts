import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './infra/prisma/prisma.module';
import { MailerModule } from './infra/mailer/mailer.module';
import { AiModule } from './ai/ai.module';
import { HealthController } from './health.controller';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { IdeaModule } from './modules/idea/idea.module';
import { BlueprintModule } from './modules/blueprint/blueprint.module';
import { CopilotModule } from './modules/copilot/copilot.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        autoLogging: false,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),

    PrismaModule,
    MailerModule,
    AiModule,

    AuthModule,
    UserModule,
    IdeaModule,
    BlueprintModule,
    CopilotModule,
    MarketplaceModule,
    WorkspaceModule,
    NotificationModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
