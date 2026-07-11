import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WorkspaceService } from './workspace.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateDocumentDto,
  CreateMilestoneDto,
  CreateTaskDto,
  UpdateDocumentDto,
  UpdateMilestoneDto,
  UpdateTaskDto,
} from './dto/workspace.dto';

@ApiTags('workspace')
@ApiBearerAuth()
@Controller()
export class WorkspaceController {
  constructor(private readonly workspace: WorkspaceService) {}

  // Create or fetch the workspace for an idea.
  @Post('ideas/:ideaId/workspace')
  getOrCreate(@CurrentUser('id') userId: string, @Param('ideaId') ideaId: string) {
    return this.workspace.getOrCreateProject(userId, ideaId);
  }

  @Get('projects/:projectId')
  board(@CurrentUser('id') userId: string, @Param('projectId') projectId: string) {
    return this.workspace.board(userId, projectId);
  }

  // --- Tasks ---
  @Post('projects/:projectId/tasks')
  addTask(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.workspace.addTask(userId, projectId, dto);
  }

  @Patch('projects/:projectId/tasks/:taskId')
  updateTask(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.workspace.updateTask(userId, projectId, taskId, dto);
  }

  @Delete('projects/:projectId/tasks/:taskId')
  deleteTask(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.workspace.deleteTask(userId, projectId, taskId);
  }

  // --- Milestones ---
  @Post('projects/:projectId/milestones')
  addMilestone(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.workspace.addMilestone(userId, projectId, dto);
  }

  @Patch('projects/:projectId/milestones/:milestoneId')
  updateMilestone(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: UpdateMilestoneDto,
  ) {
    return this.workspace.updateMilestone(userId, projectId, milestoneId, dto);
  }

  @Delete('projects/:projectId/milestones/:milestoneId')
  deleteMilestone(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    return this.workspace.deleteMilestone(userId, projectId, milestoneId);
  }

  // --- Documents ---
  @Post('projects/:projectId/documents')
  addDocument(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.workspace.addDocument(userId, projectId, dto);
  }

  @Patch('projects/:projectId/documents/:documentId')
  updateDocument(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('documentId') documentId: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.workspace.updateDocument(userId, projectId, documentId, dto);
  }

  @Delete('projects/:projectId/documents/:documentId')
  deleteDocument(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.workspace.deleteDocument(userId, projectId, documentId);
  }
}
