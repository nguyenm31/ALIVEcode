import { Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IoTObjectEntity } from '../../IoTobject/entities/IoTobject.entity';
import { IoTProjectEntity } from './IoTproject.entity';
import { IsEmpty } from 'class-validator';
import { Exclude } from 'class-transformer';
import { IoTScriptEntity } from './IoTscript.entity';

@Entity()
export class IoTProjectObjectEntity {
  @PrimaryGeneratedColumn('increment')
  @Exclude({ toClassOnly: true })
  @IsEmpty()
  id: number;

  @ManyToOne(() => IoTProjectEntity, project => project.iotProjectObjects)
  iotProject: IoTProjectEntity;

  @ManyToOne(() => IoTObjectEntity, obj => obj.iotProjectObjects, { onDelete: 'SET NULL' })
  iotObject?: IoTObjectEntity;

  @ManyToOne(() => IoTObjectEntity, obj => obj.iotProjectObjects, { onDelete: 'SET NULL' })
  iotTestObject?: IoTObjectEntity;

  @OneToOne(() => IoTScriptEntity, script => script.iotProjectObject, { onDelete: 'SET NULL' })
  iotScript?: IoTScriptEntity;
}