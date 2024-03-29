import { ChildEntity} from 'typeorm';
import { ACTIVITY_TYPE, ActivityEntity } from '../activity.entity';
import { RESOURCE_TYPE } from '../../../resource/entities/resource.entity';

/**
 * Activity of type theory model in the database
 * @author Enric Solevila
 */
@ChildEntity(ACTIVITY_TYPE.THEORY)
export class ActivityTheoryEntity extends ActivityEntity {
  /** Allowed types of resources inside the activity */
  readonly allowedResources: RESOURCE_TYPE[] = [RESOURCE_TYPE.THEORY];
}