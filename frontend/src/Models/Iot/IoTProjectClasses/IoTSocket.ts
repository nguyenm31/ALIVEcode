import {
	IoTProject,
	IoTProjectDocument,
	JsonObj,
	parseIoTProjectDocument,
} from '../IoTproject.entity';
import { IoTComponentManager } from './IoTComponentManager';
import { IoTComponent } from './IoTComponent';
import { IoTProjectLayout, parseIoTProjectLayout } from '../IoTproject.entity';
import { IOT_EVENT } from './IoTTypes';

export type IoTSocketUpdateRequest = {
	id: string;
	value: any;
};

export type IoTSocketUpdateDocumentRequest = {
	doc: IoTProjectDocument;
};

export type IoTSocketUpdateLayoutRequest = {
	layout: IoTProjectLayout;
};

export class IoTSocket {
	private socket: WebSocket;
	private id: string;
	private userId: string;
	private project: IoTProject;
	private name: string;
	private iotComponentManager: IoTComponentManager;
	private onRender: (saveLayout: boolean) => void;
	public onReceiveListen: (fields: { [key: string]: any }) => void;
	private openedOnce: boolean = false;

	constructor(
		projectId: string,
		userId: string,
		project: IoTProject,
		name: string,
		onRender: (saveLayout: boolean) => void,
		onReceiveListen: (fields: { [key: string]: any }) => void,
	) {
		this.id = projectId;
		this.userId = userId;
		this.project = project;
		this.name = name;
		this.onRender = onRender;
		this.onReceiveListen = onReceiveListen;

		this.iotComponentManager = new IoTComponentManager(
			this.project,
			(saveLayout: boolean, components: Array<IoTComponent>) => {
				this.project.layout.components = components;
				this.onRender(saveLayout);
			},
			this,
		);
		this.openSocket();
	}

	public setOnRender(onRender: (saveLayout: boolean) => void) {
		this.onRender = onRender;
	}

	public openSocket() {
		if (!process.env.IOT_URL) throw new Error('Env variable IOT_URL not set');

		if (
			this.socket &&
			(this.socket.readyState === WebSocket.OPEN ||
				this.socket.readyState === WebSocket.CONNECTING)
		)
			return;

		this.socket = new WebSocket(process.env.IOT_URL);

		this.socket.onopen = () => {
			if (process.env.DEBUG) console.log('Connected to IoTProjectSocket');

			this.socket.send(
				JSON.stringify({
					event: IOT_EVENT.CONNECT_WATCHER,
					data: {
						userId: this.userId,
						iotProjectId: this.id,
						iotProjectName: this.name,
					},
				}),
			);
		};

		this.socket.onmessage = e => {
			const req = JSON.parse(e.data);
			switch (req.event) {
				case IOT_EVENT.PING:
					this.sendEvent(IOT_EVENT.PONG, null);
					break;
				case IOT_EVENT.RECEIVE_UPDATE_COMPONENT:
					this.onReceiveUpdate(req.data);
					break;
				case IOT_EVENT.RECEIVE_DOC:
					this.onDocumentUpdate(req.data);
					break;
				case IOT_EVENT.RECEIVE_INTERFACE:
					this.onLayoutUpdate(req.data);
					break;
				case IOT_EVENT.RECEIVE_LISTEN:
					this.onReceiveListen(req.data.fields);
					break;
				default:
					// console.log('Unknown event', req);
					break;
			}
		};

		this.socket.onerror = (ev: Event) => {
			console.error(ev);
		};
	}

	public closeSocket() {
		if (this.socket && this.socket.OPEN) this.socket.close();
	}

	public sendEvent(event: IOT_EVENT, data: any) {
		this.socket.send(
			JSON.stringify({
				event,
				data,
			}),
		);
	}

	public sendAction(
		targetId: string,
		actionId: number,
		data: string | JsonObj,
	) {
		if (this.socket.OPEN) {
			let value;

			// Try to get JSON, if invalid set empty object
			if (typeof data === 'string') {
				try {
					value = JSON.parse(data);
				} catch {}
			} else {
				value = data;
			}

			this.socket.send(
				JSON.stringify({
					event: IOT_EVENT.SEND_ACTION,
					data: {
						targetId,
						actionId: Number(actionId),
						value,
					},
				}),
			);
		}
	}

	public registerListener(fields: string[]) {
		this.sendEvent(IOT_EVENT.SUBSCRIBE_LISTENER, { fields });
	}

	public onDocumentUpdate(request: IoTSocketUpdateDocumentRequest) {
		this.project.document = parseIoTProjectDocument(request.doc);
		this.getComponentManager()
			?.getComponents()
			.map(c => c.updateRef());
		this.onRender(false);
	}

	public onLayoutUpdate(request: IoTSocketUpdateLayoutRequest) {
		this.project.layout = parseIoTProjectLayout(request.layout);
		this.getComponentManager()?.setNewLayout(this.project.layout);
		this.onRender(false);
	}

	public onReceiveUpdate(request: IoTSocketUpdateRequest) {
		this.getComponentManager()?.updateComponent(request.id, request.value);
	}

	public getComponentManager(): IoTComponentManager | null {
		return this.iotComponentManager;
	}
}
