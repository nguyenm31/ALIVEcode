import Form from "../../../UtilsComponents/Form/Form"
import { IOTOBJECT_LABEL } from '../../../../Models/Iot/IoTobject.entity';
import { useAlert } from 'react-alert';
import { IoTObjectCreateProps } from './iotObjectCreateProps';

const IoTObjectCreate = ({ onSubmit }: IoTObjectCreateProps) => {
	const alert = useAlert();

	return (
		<Form
			onSubmit={res => {
				onSubmit && onSubmit(res);
				return alert.success('Objet connecté créé avec succès');
			}}
			name="iot_object"
			url="iot/objects"
			action="POST"
			inputGroups={[
				{
					name: 'name',
					required: true,
					inputType: 'text',
					minLength: 3,
					maxLength: 25,
				},
				{
					name: 'description',
					required: false,
					inputType: 'text',
					maxLength: 200,
				},
				{
					name: 'label',
					required: true,
					inputType: 'select',
					selectOptions: IOTOBJECT_LABEL,
				},
			]}
		/>
	);
};

export default IoTObjectCreate;