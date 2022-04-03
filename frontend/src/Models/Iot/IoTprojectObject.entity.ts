import { Exclude, Type } from 'class-transformer';
import { IoTObject } from './IoTobject.entity';
import { IoTProject } from './IoTproject.entity';
import { AsScript } from '../AsScript/as-script.entity';

export enum PROJECT_OBJECT_TARGET {
	OBJECT = 'O',
	TEST = 'T',
}
export class IoTProjectObject {
	@Exclude({ toPlainOnly: true })
	id: number;

	@Type(() => IoTProject)
	iotProject: IoTProject;

	@Type(() => IoTObject)
	iotObject: IoTObject;

	@Type(() => IoTObject)
	iotTestObject?: IoTObject;

	@Type(() => AsScript)
	script?: AsScript;

	scriptId?: string;

	private currentTarget: PROJECT_OBJECT_TARGET;

	get target() {
		if (this.currentTarget === PROJECT_OBJECT_TARGET.OBJECT)
			return this.iotObject;
		return this.iotTestObject;
	}
}
