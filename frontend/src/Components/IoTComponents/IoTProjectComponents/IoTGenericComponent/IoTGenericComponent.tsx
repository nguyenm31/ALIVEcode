import {
	IoTGenericComponentProps,
	StyledIoTGenericComponent,
} from './iotGenericComponentTypes';
import { IOT_COMPONENT_TYPE } from '../../../../Models/Iot/IoTProjectClasses/IoTComponent';
import IoTButtonComponent from '../IoTButtonComponent/IoTButtonComponent';
import IoTProgressBarComponent from '../IoTProgressBarComponent/IoTProgressBarComponent';
import IoTLogsComponent from '../IoTLogsComponent/IoTLogsComponent';
import { IoTLogs } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTLogs';
import { IoTProgressBar } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTProgressBar';
import { faClipboard, faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { IoTButton } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTButton';
import { useAlert } from 'react-alert';
import { IoTLed } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTLed';
import IoTLedComponent from '../IoTLedComponent/IoTLedComponent';
import { IoTLabel } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTLabel';
import IoTLabelComponent from '../IoTLabelComponent/IoTLabelComponent';
import IoTBuzzerComponent from '../IoTBuzzerComponent/IoTBuzzerComponent';
import { IoTBuzzer } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTBuzzer';
import IoTTrafficLightComponent from '../IoTTrafficLightComponent/IoTTrafficLightComponent';
import { IoTTrafficLight } from '../../../../Models/Iot/IoTProjectClasses/Components/IoTTrafficLight';
import { useTranslation } from 'react-i18next';

const IoTGenericComponent = ({
	component,
	selectable,
	onSelect,
	setEditingComponent,
}: IoTGenericComponentProps) => {
	const { t } = useTranslation();
	const [isHovering, setIsHovering] = useState(false);
	const alert = useAlert();

	const renderSpecificComponent = (): React.ReactNode => {
		switch (component.type) {
			case IOT_COMPONENT_TYPE.BUTTON:
				return <IoTButtonComponent component={component as IoTButton} />;
			case IOT_COMPONENT_TYPE.PROGRESS_BAR:
				return (
					<IoTProgressBarComponent component={component as IoTProgressBar} />
				);
			case IOT_COMPONENT_TYPE.LOGS:
				return <IoTLogsComponent component={component as IoTLogs} />;
			case IOT_COMPONENT_TYPE.LED:
				return <IoTLedComponent component={component as IoTLed} />;
			case IOT_COMPONENT_TYPE.LABEL:
				return <IoTLabelComponent component={component as IoTLabel} />;
			case IOT_COMPONENT_TYPE.BUZZER:
				return <IoTBuzzerComponent component={component as IoTBuzzer} />;
			case IOT_COMPONENT_TYPE.TRAFFIC_LIGHT:
				return (
					<IoTTrafficLightComponent component={component as IoTTrafficLight} />
				);
		}
	};

	return (
		<StyledIoTGenericComponent
			ishovering={isHovering ? 1 : 0}
			selectable={selectable ? 1 : 0}
			onMouseOver={() => !isHovering && setIsHovering(true)}
			onMouseLeave={() => isHovering && setIsHovering(false)}
			error={!component.isRefValueValid()}
			onClick={() => selectable && onSelect && onSelect()}
		>
			<div className="component">
				<label className="component-name">{component.name}</label>
				{!component.isRefValueValid() && (
					<i>
						<div className="font-bold text-red-600">
							{t('iot.project.interface.errors.ref')}
						</div>
					</i>
				)}
				{renderSpecificComponent()}
				{setEditingComponent && (
					<FontAwesomeIcon
						onClick={() => setEditingComponent(component)}
						className="component-btn edit-component-btn"
						icon={faWrench}
						size="2x"
					/>
				)}
				{!selectable && (
					<FontAwesomeIcon
						onClick={() => {
							if (!component.id) return alert.error('The component has no id');
							navigator.clipboard.writeText(component.id);
							alert.success('Copied');
						}}
						className="component-btn copyid-component-btn"
						icon={faClipboard}
						size="2x"
					/>
				)}
			</div>
		</StyledIoTGenericComponent>
	);
};

export default IoTGenericComponent;
