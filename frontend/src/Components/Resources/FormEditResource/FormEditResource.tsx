import { RESOURCE_TYPE } from '../../../Models/Resource/resource.entity';
import { useForm } from 'react-hook-form';
import InputGroup from '../../UtilsComponents/InputGroup/InputGroup';
import {
	FormEditResourceDTO,
	FormEditResourceProps,
} from './formEditResourceTypes';
import Button from '../../UtilsComponents/Buttons/Button';
import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../../state/contexts/UserContext';
import LoadingScreen from '../../UtilsComponents/LoadingScreen/LoadingScreen';

const FormEditResource = ({ resource }: FormEditResourceProps) => {
	const [type, setType] = useState<RESOURCE_TYPE>(resource.type);
	const { t } = useTranslation();
	const { resources, updateResource } = useContext(UserContext);

	const anyRes = resource as any;

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormEditResourceDTO>({
		defaultValues: {
			type,
			resource: {
				name: resource.name,
				subject: resource.subject,
				url: anyRes.url,
				extension: anyRes.extension,
			},
		},
	});
	if (!resources) return <LoadingScreen />;

	const onSubmit = async (formValues: FormEditResourceDTO) => {
		await updateResource(resource, formValues);
	};

	const renderSpecificFields = () => {
		switch (type) {
			case RESOURCE_TYPE.CHALLENGE:
				return <></>;
			case RESOURCE_TYPE.THEORY:
				return <></>;
			case RESOURCE_TYPE.VIDEO:
				return (
					<InputGroup
						label="Url"
						errors={errors.resource?.url}
						{...register('resource.url', { required: true })}
					/>
				);
			case RESOURCE_TYPE.FILE:
				return <></>;
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<InputGroup
				as="select"
				label="Type"
				errors={errors.resource?.name}
				{...register('type', { required: true })}
				onChange={(e: any) => {
					setType(e.target.value);
				}}
			>
				<option value={RESOURCE_TYPE.FILE}>{t('resources.file.name')}</option>
				<option value={RESOURCE_TYPE.VIDEO}>{t('resources.video.name')}</option>
				<option value={RESOURCE_TYPE.THEORY}>
					{t('resources.theory.name')}
				</option>
				<option value={RESOURCE_TYPE.CHALLENGE}>
					{t('resources.challenge.name')}
				</option>
			</InputGroup>
			<InputGroup
				label="Name"
				errors={errors.resource?.name}
				{...register('resource.name', { required: true })}
			/>
			{renderSpecificFields()}
			<Button variant="primary" type="submit" className="mt-3">
				{t('resources.form.update')}
			</Button>
		</form>
	);
};

export default FormEditResource;
