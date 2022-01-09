import { CreatedByUser } from '../Generics/createdByUser.entity';
import { User } from '../User/user.entity';
import { IotRoute } from './IoTroute.entity';
import api from '../api';
import { IOT_COMPONENT_TYPE } from './IoTProjectClasses/IoTComponent';
import {
	Transform,
	plainToClass,
	TransformationType,
	Type,
} from 'class-transformer';
import { IoTButton } from './IoTProjectClasses/Components/IoTButton';
import { IoTComponent } from './IoTProjectClasses/IoTComponent';
import { IoTProgressBar } from './IoTProjectClasses/Components/IoTProgressBar';
import { IoTLogs } from './IoTProjectClasses/Components/IoTLogs';
import { IoTObject } from './IoTobject.entity';
import { IoTLed } from './IoTProjectClasses/Components/IoTLed';
import { IoTLabel } from './IoTProjectClasses/Components/IoTLabel';
import { IoTBuzzer } from './IoTProjectClasses/Components/IoTBuzzer';
import { isArray } from 'tone';

export enum IOTPROJECT_INTERACT_RIGHTS {
	ANYONE = 'AN',
	COLLABORATORS = 'CO',
	PRIVATE = 'PR',
}

export enum IOTPROJECT_ACCESS {
	PUBLIC = 'PU', // can be found via a search
	UNLISTED = 'UN', // must be shared via a url
	RESTRICTED = 'RE', // limited to certain classes
	PRIVATE = 'PR', // only accessible to the creator
}

export class IoTProjectLayout {
	@Transform(({ value: components, type }) => {
		if (type !== TransformationType.PLAIN_TO_CLASS || !components) {
			return components;
		}
		components = components.map((comp: IoTComponent) => {
			if (comp.type === IOT_COMPONENT_TYPE.BUTTON)
				return plainToClass(IoTButton, comp);
			if (comp.type === IOT_COMPONENT_TYPE.PROGRESS_BAR)
				return plainToClass(IoTProgressBar, comp);
			if (comp.type === IOT_COMPONENT_TYPE.LOGS)
				return plainToClass(IoTLogs, comp);
			if (comp.type === IOT_COMPONENT_TYPE.LED)
				return plainToClass(IoTLed, comp);
			if (comp.type === IOT_COMPONENT_TYPE.LABEL)
				return plainToClass(IoTLabel, comp);
			if (comp.type === IOT_COMPONENT_TYPE.BUZZER)
				return plainToClass(IoTBuzzer, comp);

			return undefined;
		});

		components = components.filter((c: IoTComponent | undefined) => c != null);
		return components;
	})
	components: Array<IoTComponent>;
}

export type JsonKeys =
	| string
	| number
	| boolean
	| null
	| Array<JsonKeys>
	| Array<JsonObj>
	| JsonObj;
export type JsonObj = { [key: string]: JsonKeys };

export type IoTProjectDocument = JsonObj;

export class IoTProject extends CreatedByUser {
	creator: User;

	@Type(() => IoTProjectLayout)
	layout: IoTProjectLayout;

	// Date transforming
	@Transform(({ value: obj, type }) => {
		if (type !== TransformationType.PLAIN_TO_CLASS || !obj) {
			return obj;
		}

		if (typeof obj !== 'object') {
			return {};
		}

		const getEntriesDeep = (
			entries: [string, any][],
		): { [key: string]: any } => {
			const res: { [key: string]: any } = {};

			entries.forEach(entry => {
				const key = entry[0];
				const val = entry[1];

				const parse = (val: any): any => {
					if (isArray(val)) {
						return val.map(v => parse(v));
					} else if (typeof val === 'object') {
						return getEntriesDeep(Object.entries(val));
					} else if (typeof val === 'string') {
						const match = /\/Date\((\d*)\)\//.exec(val);
						if (match) {
							return new Date(+match[1]);
						} else {
							const parsedDate = new Date(val);
							if (
								Object.prototype.toString.call(parsedDate) ===
									'[object Date]' &&
								!isNaN(parsedDate.getTime())
							)
								return parsedDate;
						}
					}
					return val;
				};

				res[key] = parse(val);
			});
			return res;
		};

		const res = getEntriesDeep(Object.entries(obj));
		console.log(res);
		return res;
	})
	document: IoTProjectDocument;

	@Type(() => IoTObject)
	iotObjects?: IoTObject[];

	access: IOTPROJECT_ACCESS;

	interactRights: IOTPROJECT_INTERACT_RIGHTS;

	collaborators: User[];

	routes: IotRoute[];

	async getRoutes() {
		return await api.db.iot.projects.getRoutes({ id: this.id });
	}

	async getIoTObjects() {
		this.iotObjects = await api.db.iot.projects.getObjects({ id: this.id });
		return this.iotObjects;
	}
}
