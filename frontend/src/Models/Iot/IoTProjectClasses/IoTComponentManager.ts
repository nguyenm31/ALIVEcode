import { IoTProjectLayout } from '../IoTproject.entity';
import { IoTTarget } from './IoTTypes';
import { IoTComponent } from './IoTComponent';

export class IoTComponentManager {
	private components: IoTProjectLayout;
	private onLayoutUpdate: (layout: IoTProjectLayout) => void;
	private onRender: (layout: IoTProjectLayout) => void;

	constructor(
		layout: IoTProjectLayout,
		onLayoutUpdate: (layout: IoTProjectLayout) => void,
		onRender: (layout: IoTProjectLayout) => void,
	) {
		this.components = layout;
		this.onLayoutUpdate = onLayoutUpdate;
		this.onRender = onRender;

		this.onRender(this.components);
	}

	public onReceive() {}

	public updateComponent(id: string, data: any) {
		const component = this.getComponent(id);
		if (!component) throw new Error(`No component with id ${id}`);
		console.log(component);
		component.update(data);
		this.onRender(this.components);
	}

	public getComponent(id: string): IoTComponent | undefined {
		return this.components.find(c => c.id === id);
	}

	public getComponents(): IoTProjectLayout {
		return this.components;
	}

	private addComponent() {}

	public save() {}

	public send(target: IoTTarget) {}

	public render() {
		this.onRender(this.components);
	}
}