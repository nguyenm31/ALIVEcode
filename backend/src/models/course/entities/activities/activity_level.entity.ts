import { ChildEntity, OneToMany } from 'typeorm';
import { ACTIVIY_TYPE, ActivityEntity } from '../activity.entity';
import { LevelEntity } from '../../../level/entities/level.entity';

/**
 * Activity of type Level model in the database
 * @author Enric Solevila
 */
@ChildEntity(ACTIVIY_TYPE.LEVEL)
export class ActivityLevelEntity extends ActivityEntity {
  /** Reference to the level to display */
  @OneToMany(() => LevelEntity, level => level.activities)
  level: LevelEntity;
}