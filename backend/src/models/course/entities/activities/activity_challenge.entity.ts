import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { ACTIVITY_TYPE, ActivityEntity } from '../activity.entity';
import { ResourceChallengeEntity } from '../../../resource/entities/resource_challenge.entity';

/**
 * Activity of type challenge model in the database
 * @author Enric Solevila
 */
@ChildEntity(ACTIVITY_TYPE.CHALLENGE)
export class ActivityChallengeEntity extends ActivityEntity {
  /** Reference to the resource linked to the activity */
  @ManyToOne(() => ResourceChallengeEntity, res => res.activities, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resourceId' })
  resource: ResourceChallengeEntity;

  /** Id of the referenced resource */
  @Column({ type: 'uuid', nullable: true })
  resourceId: string;
}