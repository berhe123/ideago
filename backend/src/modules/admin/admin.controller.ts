import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  @Get('users')
  users() {
    return this.admin.listUsers();
  }

  @Get('ideas')
  ideas() {
    return this.admin.listIdeas();
  }

  @Patch('users/:id/role')
  setRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.admin.setUserRole(id, role);
  }
}
