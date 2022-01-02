import { useMemo } from 'react';
import { createDefaultIoTProgressBar } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTProgressBar';
import { createDefaultIoTLogs } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTLogs';
import { createDefaultIoTButton } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTButton';
import IoTGenericComponent from '../../IoTProjectComponents/IoTGenericComponent/IoTGenericComponent';
import { createDefaultIoTLed } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTLed';
import {
	StyledIoTComponentCreator,
	IoTComponentCreatorProps,
} from './iotComponentCreatorTypes';
import { createDefaultIoTLabel } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTLabel';
import { createDefaultIoTBuzzer } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTBuzzer';

export const IoTComponentCreator = ({ onSelect }: IoTComponentCreatorProps) => {
	const components = useMemo(
		() => [
			createDefaultIoTProgressBar(),
			createDefaultIoTButton(),
			createDefaultIoTLogs(),
			createDefaultIoTLed(),
			createDefaultIoTLabel(),
			createDefaultIoTBuzzer(),
		],
		[],
	);

	return (
		<StyledIoTComponentCreator>
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
				{components.map(c => (
					<IoTGenericComponent
						selectable
						onSelect={() => onSelect(c)}
						component={c}
					/>
				))}
			</div>
		</StyledIoTComponentCreator>
	);
};

export default IoTComponentCreator;