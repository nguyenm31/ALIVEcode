import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException } from '@nestjs/common';
import { IoTRouteService } from './IoTroute.service';
import { UserEntity } from '../../user/entities/user.entity';
import { Auth } from '../../utils/decorators/auth.decorator';
import { User } from '../../utils/decorators/user.decorator';
import { Role } from '../../utils/types/roles.types';
import { hasRole } from '../../user/auth';
import { IotRouteEntity } from './entities/IoTroute.entity';
import { IoTProjectService } from '../IoTproject/IoTproject.service';

@Controller('iot/routes')
export class IoTRouteController {
  constructor(
    private readonly IoTRouteService: IoTRouteService,
    private readonly IoTProjectService: IoTProjectService,
  ) {}

  @Post('projects/:id/routes')
  @Auth()
  async create(@User() user: UserEntity, @Param('id') id: string, @Body() createIoTobjectDto: IotRouteEntity) {
    const project = await this.IoTProjectService.findOne(id);
    if (project.creator.id !== user.id && !hasRole(user, Role.STAFF))
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    return await this.IoTRouteService.create(project, createIoTobjectDto);
  }

  @Get('projects/:id/routes')
  @Auth(Role.STAFF)
  async findAll() {
    return await this.IoTRouteService.findAll();
  }

  @Get('projects/:id/routes')
  @Auth(Role.STAFF)
  async findOne(@Param('id') id: string) {
    return await this.IoTRouteService.findOne(id);
  }

  @Patch('projects/:projectId/routes/:id')
  @Auth()
  async update(
    @User() user: UserEntity,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateIoTobjectDto: IotRouteEntity,
  ) {
    if (!id) throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    const project = await this.IoTProjectService.findOne(projectId);
    if (project.creator.id !== id && !hasRole(user, Role.STAFF))
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    return await this.IoTRouteService.update(project.id, updateIoTobjectDto);
  }

  @Delete('projects/:id/routes')
  @Auth()
  async remove(@User() user: UserEntity, @Param('projectId') projectId: string, @Param('id') id: string) {
    if (!id) throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    const project = await this.IoTProjectService.findOne(projectId);
    if (project.creator.id !== id && !hasRole(user, Role.STAFF))
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    return await this.IoTRouteService.remove(id);
  }
}
