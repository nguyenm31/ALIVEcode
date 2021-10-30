import { Module } from '@nestjs/common';
import { IoTGateway } from './iot.gateway';
import { IoTObjectService } from '../../models/iot/IoTobject/IoTobject.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IoTObjectEntity } from '../../models/iot/IoTobject/entities/IoTobject.entity';
import { IoTProjectEntity } from '../../models/iot/IoTproject/entities/IoTproject.entity';
import { IoTRouteEntity } from '../../models/iot/IoTroute/entities/IoTroute.entity';
import { IoTProjectService } from '../../models/iot/IoTproject/IoTproject.service';

@Module({
  imports: [TypeOrmModule.forFeature([IoTObjectEntity, IoTProjectEntity, IoTRouteEntity])],
  providers: [IoTObjectService, IoTProjectService, IoTGateway],
})
export class IoTModule {}