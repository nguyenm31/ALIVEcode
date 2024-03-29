import { Type } from 'class-transformer';
import { Activity } from '../activity.entity';
import { ResourceVideo } from '../../Resource/resources/resource_video.entity';
import { RESOURCE_TYPE } from '../../Resource/resource.entity';

/**
 * Activity of type Video model in the database
 * @author Enric Solevila
 */
export class ActivityVideo extends Activity {
	/** Id of the resource of the activity */
	resourceId?: string;

	/** Resource of the activity */
	@Type(() => ResourceVideo)
	resource?: ResourceVideo;

	/** Allowed types of resources inside the activity */
	readonly allowedResources: RESOURCE_TYPE[] = [RESOURCE_TYPE.VIDEO];
}
